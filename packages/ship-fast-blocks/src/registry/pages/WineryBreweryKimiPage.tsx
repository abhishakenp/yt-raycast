import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * WineryBreweryKimiPage — a complete, self-contained estate-WINERY / vineyard
 * (or craft-BREWERY / distillery) marketing LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Terroir & Oak Estate Winery"
 * design: a warm, earthy, editorial aesthetic on a soft stone canvas with a
 * deep wine/burgundy accent, light serif-style display headings, and a slow,
 * elegant hospitality mood. It pairs a full-bleed photographic hero (est. pill +
 * huge light headline + dual CTAs + scroll cue) with a 3-up "estate values"
 * features row, a split "our story" band (stacked photos + family narrative +
 * harvest/acres/varietal counters), a masonry estate gallery, a dark stats band,
 * a 6-up current-releases wine grid (vintage badge, price, tasting notes, ABV),
 * a tasting-experiences section (numbered booking steps + two tasting tiers),
 * three guest testimonials with star ratings and headshots, a "visit the estate"
 * block (address/hours/contact + reservation request form), a parallax wine-club
 * CTA band, an FAQ accordion, and a rich 4-column footer with social links.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy.
 * Kimi's `wine`/`stone` palette maps to semantic tokens: primary = wine/burgundy
 * accent, background/muted = warm stone surfaces, foreground = stone text. Every
 * nav item / CTA / link / form submit routes through `useNavigate` (never a dead
 * "#"), and navbar labels match the `nav` array so PageSwitch can swap pages. All
 * imagery (vineyard photos, gallery, guest headshots) uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const WineryBreweryKimiPage = defineComponent({
  name: "WineryBreweryKimiPage",
  description:
    "Complete estate-WINERY / vineyard and craft-BREWERY / distillery marketing LANDING page with a warm, earthy, editorial aesthetic: soft stone canvas, deep wine/burgundy accent, light display headings and an elegant hospitality mood. Includes a full-bleed photographic hero (est.-year pill, large light headline, dual CTAs, scroll cue), a 3-up estate-values features row with icons, a split our-story band (stacked vineyard photos + multi-generation family narrative + harvests/acres/varietal counters), a masonry estate photo gallery, a dark stats band, a 6-up current-releases wine grid (vintage badge, bottle price, tasting notes, ABV / 750ml), a tasting-experiences section (numbered booking steps plus two tasting tiers with feature checklists), three guest testimonials with five-star ratings and headshots, a visit-the-estate block (address, hours, contact + a full reservation request form with date / guests / experience selects), a parallax wine-club membership CTA band, an FAQ accordion, and a rich 4-column footer with social icons. Use as the ROOT/home page for wineries, vineyards, wine estates, tasting rooms, breweries, cideries, meaderies, distilleries, or any wine/beverage hospitality and direct-to-consumer brand wanting a refined, photo-led, reservation-driven page with wine catalog, tasting bookings and social proof. Supply content only — brand, nav, hero, features, story, gallery, stats, wines, tastings, testimonials, visit, club, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / estate name shown in the navbar and footer. */
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
        bookCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Estate-values feature row. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Split "our story" band. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        imageAlt1: z.string().optional(),
        imageAlt2: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Estate photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark "by the numbers" stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Current-releases wine grid. */
    wines: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              vintage: z.string(),
              price: z.string(),
              name: z.string(),
              notes: z.string(),
              abv: z.string(),
              size: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tasting experiences section. */
    tastings: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        options: z
          .array(
            z.object({
              name: z.string(),
              meta: z.string(),
              price: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Guest testimonials. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              meta: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Visit-the-estate block + reservation form. */
    visit: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        address: z.array(z.string()).optional(),
        hours: z.array(z.string()).optional(),
        contact: z.array(z.string()).optional(),
        directionsTitle: z.string().optional(),
        directions: z.array(z.string()).optional(),
        formTitle: z.string().optional(),
        experienceOptions: z.array(z.string()).optional(),
        submit: z.string().optional(),
        finePrint: z.string().optional(),
      })
      .optional(),
    /** Wine-club membership CTA band. */
    club: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        visitTitle: z.string().optional(),
        visitLines: z.array(z.string()).optional(),
        hoursTitle: z.string().optional(),
        hoursLines: z.array(z.string()).optional(),
        linksTitle: z.string().optional(),
        links: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Terroir & Oak"
    const nav = props.nav?.length
      ? props.nav
      : ["Our Story", "Wines", "Tastings", "Visit"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 1987 • Napa Valley"
    const heroTop = props.hero?.headingTop ?? "Where Earth"
    const heroBottom = props.hero?.headingBottom ?? "Meets Elegance"
    const heroSub =
      props.hero?.subheading ??
      "Experience award-winning wines crafted with patience, passion, and respect for the land. Join us for intimate tastings and vineyard tours."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Tastings"
    const heroSecondary = props.hero?.secondaryCta ?? "Plan Your Visit"
    const heroBook = props.hero?.bookCta ?? "Book Now"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Sunset over rolling vineyard hills with rows of grapevines stretching toward the horizon"

    const features = props.features?.length
      ? props.features
      : [
          {
            title: "Estate Grown",
            description:
              "Every grape is cultivated on our 45-acre estate, where volcanic soils and coastal fog create wines of exceptional character and depth.",
          },
          {
            title: "Time Honored",
            description:
              "Our wines age gracefully in French oak barrels for 18-36 months, developing the complex layers that distinguish truly exceptional vintages.",
          },
          {
            title: "Sustainable Craft",
            description:
              "Certified organic since 2005, we practice dry farming and biodiversity initiatives that honor the earth while producing extraordinary wines.",
          },
        ]

    const storyEyebrow = props.story?.eyebrow ?? "Our Story"
    const storyTop = props.story?.headingTop ?? "Three Generations"
    const storyBottom = props.story?.headingBottom ?? "of Passion"
    const storyParagraphs = props.story?.paragraphs?.length
      ? props.story.paragraphs
      : [
          "Terroir & Oak began in 1987 when Marco and Elena Ferraro purchased a neglected hillside plot in the cooler reaches of Napa Valley. What started as a weekend dream became a life's devotion—transforming rocky, challenging terrain into vineyards that now produce some of the region's most sought-after wines.",
          "Today, their daughter Alessandra leads our winemaking, bringing modern techniques to time-honored traditions. Our cellar produces just 8,000 cases annually, allowing meticulous attention to every barrel, every bottle.",
          "We believe great wine tells the story of its place—our fog-kissed mornings, our iron-rich soils, our family's hands in every harvest. This is wine crafted with intention, patience, and profound respect for nature.",
        ]
    const storyImage1 =
      props.story?.imageAlt1 ??
      "Senior winemaker in straw hat inspecting ripe wine grapes on the vine during harvest"
    const storyImage2 =
      props.story?.imageAlt2 ??
      "Interior of a wine cellar with rows of oak barrels aging wine in dim atmospheric lighting"
    const storyStats = props.story?.stats?.length
      ? props.story.stats
      : [
          { value: "37", label: "Harvests" },
          { value: "45", label: "Acres" },
          { value: "12", label: "Wine Varietals" },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "The Estate"
    const galleryHeading = props.gallery?.heading ?? "A Place of Beauty"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Aerial view of lush green vineyard rows on rolling hills at golden hour",
          "Close-up of hands holding a wine glass with deep red wine in natural light",
          "Rustic stone winery building entrance with wooden doors and climbing vines",
          "Wine tasting room with elegant glassware and soft natural lighting through windows",
          "Wooden wine barrel in a cool cellar with morning light streaming through",
          "Ripe purple wine grapes cluster on vine ready for harvest",
          "Outdoor wine tasting table set among vines with glasses and cheese pairing",
          "Sun setting behind vineyard hills casting warm golden light across the estate",
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "8,000", label: "Cases Produced" },
          { value: "18", label: "Months Aged" },
          { value: "94+", label: "Critic Scores" },
          { value: "2,400", label: "Guests Annually" },
        ]

    const winesEyebrow = props.wines?.eyebrow ?? "Current Releases"
    const winesHeading = props.wines?.heading ?? "Our Wines"
    const winesDesc =
      props.wines?.description ??
      "Each bottle reflects a specific moment in time—our climate, our soil, our careful hands. Available for tasting and purchase at the estate."
    const wineItems = props.wines?.items?.length
      ? props.wines.items
      : [
          {
            vintage: "2021 Vintage",
            price: "$68",
            name: "Estate Cabernet Sauvignon",
            notes:
              "Bold and structured with notes of blackcurrant, cedar, and graphite. Aged 24 months in French oak. 94 points, Wine Spectator.",
            abv: "14.8% ABV",
            size: "750ml",
          },
          {
            vintage: "2022 Vintage",
            price: "$54",
            name: "Reserve Pinot Noir",
            notes:
              "Elegant and earthy with cherry, mushroom, and spice notes. Silky tannins from our highest elevation block. 92 points, Wine Enthusiast.",
            abv: "13.5% ABV",
            size: "750ml",
          },
          {
            vintage: "2023 Vintage",
            price: "$42",
            name: "Estate Chardonnay",
            notes:
              "Balanced and mineral-driven with citrus, green apple, and subtle vanilla. Fermented in concrete and oak. 91 points, Vinous.",
            abv: "13.2% ABV",
            size: "750ml",
          },
          {
            vintage: "2021 Vintage",
            price: "$78",
            name: "Library Merlot",
            notes:
              "Velvety and complex with plum, chocolate, and tobacco. From our oldest vines, aged 30 months. Limited release of 400 cases.",
            abv: "14.5% ABV",
            size: "750ml",
          },
          {
            vintage: "NV",
            price: "$48",
            name: "Blanc de Blancs",
            notes:
              "Traditional method sparkling wine with fine bubbles, citrus, and brioche notes. Aged on lees for 36 months. Perfect celebration wine.",
            abv: "12.0% ABV",
            size: "750ml",
          },
          {
            vintage: "2020 Vintage",
            price: "$95",
            name: "Heritage Red Blend",
            notes:
              "Our flagship wine—Cabernet Sauvignon, Merlot, and Cabernet Franc in perfect harmony. Decant for 2 hours. 96 points, James Suckling.",
            abv: "14.9% ABV",
            size: "750ml",
          },
        ]

    const tastingsEyebrow = props.tastings?.eyebrow ?? "Experiences"
    const tastingsHeading = props.tastings?.heading ?? "Tasting Experiences"
    const tastingsDesc =
      props.tastings?.description ??
      "Join us for curated tastings led by our knowledgeable hosts. Each experience offers a unique perspective on our wines, our terroir, and our philosophy. Advance reservations required."
    const tastingSteps = props.tastings?.steps?.length
      ? props.tastings.steps
      : [
          {
            title: "Reserve Your Time",
            description:
              "Book online or call our concierge at (707) 555-0192. Groups of 2-8 guests.",
          },
          {
            title: "Arrive & Settle",
            description:
              "Check in at our tasting room 10 minutes early. Complimentary welcome pour included.",
          },
          {
            title: "Enjoy & Learn",
            description:
              "Guided tasting with stories behind each wine. Ask questions—our hosts love sharing.",
          },
          {
            title: "Purchase & Join",
            description:
              "Take home favorites with member pricing. Join our wine club for exclusive access.",
          },
        ]
    const tastingOptions = props.tastings?.options?.length
      ? props.tastings.options
      : [
          {
            name: "Classic Estate Tasting",
            meta: "60 minutes • Indoor or terrace",
            price: "$45",
            description:
              "Five current-release wines paired with artisanal cheeses and locally baked bread. Perfect introduction to our estate.",
            features: [
              "5 wine pours (2oz each)",
              "Artisanal cheese pairing",
              "Take-home tasting notes",
            ],
            cta: "Book Classic Tasting",
            featured: false,
          },
          {
            name: "Heritage Library Experience",
            meta: "90 minutes • Private cellar room",
            price: "$95",
            description:
              "Rare library vintages and limited releases with guided cellar tour. Includes chocolate and charcuterie pairing.",
            features: [
              "6 pours including library wines",
              "Private cellar tour",
              "Premium pairing plate",
              "Complimentary wine club enrollment",
            ],
            cta: "Book Heritage Experience",
            featured: true,
          },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Guest Experiences"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Visitors Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Heritage tasting was incredible. Our host knew every detail about the wines and the vineyard history. The library Cabernet was worth the trip alone.",
            name: "Sarah Mitchell",
            meta: "Visited March 2025",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair wearing a light sweater",
          },
          {
            quote:
              "We joined the wine club after our visit and haven't looked back. The quarterly shipments are exceptional, and the member events are intimate and memorable.",
            name: "David Chen",
            meta: "Wine Club Member since 2023",
            avatarAlt:
              "Professional headshot of a man in his 40s with short brown hair and a friendly smile",
          },
          {
            quote:
              "Brought our anniversary celebration here and it exceeded expectations. The terrace views at sunset paired with their Pinot Noir made it unforgettable.",
            name: "Elena Rodriguez",
            meta: "Visited February 2025",
            avatarAlt:
              "Professional headshot of a smiling woman with curly dark hair and warm expression",
          },
        ]

    const visitEyebrow = props.visit?.eyebrow ?? "Plan Your Visit"
    const visitHeading = props.visit?.heading ?? "Visit the Estate"
    const visitDesc =
      props.visit?.description ??
      "We're located in the heart of Napa Valley, 10 minutes north of St. Helena. Whether you're planning a weekend escape or a day of tasting, we look forward to welcoming you."
    const visitAddress = props.visit?.address?.length
      ? props.visit.address
      : ["1280 Silverado Trail North", "Napa, CA 94558"]
    const visitHours = props.visit?.hours?.length
      ? props.visit.hours
      : ["Thursday–Monday: 10am–5pm", "Tuesday–Wednesday: By appointment"]
    const visitContact = props.visit?.contact?.length
      ? props.visit.contact
      : ["(707) 555-0192", "concierge@terroirandoak.com"]
    const directionsTitle = props.visit?.directionsTitle ?? "Getting Here"
    const directions = props.visit?.directions?.length
      ? props.visit.directions
      : [
          "From San Francisco: Take Highway 29 north through Napa. Turn left on Oakville Cross Road, then right onto Silverado Trail. We're 2 miles ahead on the right.",
          "Parking is complimentary. Designated driver? We offer sparkling water and artisanal coffee flights.",
        ]
    const formTitle = props.visit?.formTitle ?? "Request a Reservation"
    const experienceOptions = props.visit?.experienceOptions?.length
      ? props.visit.experienceOptions
      : [
          "Select an experience...",
          "Classic Estate Tasting ($45/person)",
          "Heritage Library Experience ($95/person)",
          "Private Group Event (Contact us)",
        ]
    const visitSubmit = props.visit?.submit ?? "Request Reservation"
    const visitFinePrint =
      props.visit?.finePrint ??
      "We'll confirm your booking via email within 24 hours. Cancellations must be made 48 hours in advance."

    const clubEyebrow = props.club?.eyebrow ?? "Join the Family"
    const clubHeading = props.club?.heading ?? "Become a Wine Club Member"
    const clubDesc =
      props.club?.description ??
      "Receive quarterly shipments of our finest selections, exclusive access to library vintages, complimentary tastings, and invitations to members-only harvest events. From $95 per quarter."
    const clubPrimary = props.club?.primaryCta ?? "Explore Membership"
    const clubSecondary = props.club?.secondaryCta ?? "Book a Visit First"
    const clubImageAlt =
      props.club?.imageAlt ??
      "Close-up of red wine being poured into an elegant crystal wine glass"

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "FAQ"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need a reservation?",
            a: "Yes, we require advance reservations for all tastings to ensure personalized attention. You can book online or call us at (707) 555-0192. We recommend booking at least 2 weeks ahead for weekend visits.",
          },
          {
            q: "Can I bring children?",
            a: "Children are welcome on the estate grounds, but our tastings are designed for adults 21 and over. We offer grape juice tastings for younger visitors and have beautiful gardens for families to enjoy.",
          },
          {
            q: "Do you accommodate dietary restrictions?",
            a: "Absolutely. Our pairings can be adapted for vegetarian, vegan, gluten-free, and most allergies. Please note any restrictions when booking so our culinary team can prepare accordingly.",
          },
          {
            q: "Can I purchase wine without a tasting?",
            a: "Yes, our tasting room is open for bottle purchases Thursday through Monday, 10am to 5pm. Wine club members receive 20% off all purchases.",
          },
          {
            q: "Do you ship wine?",
            a: "We ship to 42 states. Shipping is complimentary for wine club members and orders over $150. Please allow 3-5 business days for delivery. Someone 21+ must be available to sign for the package.",
          },
        ]

    const footerAbout =
      props.footer?.about ??
      "Estate winery crafting exceptional wines since 1987. Visit us in Napa Valley for tastings, tours, and unforgettable experiences."
    const footerVisitTitle = props.footer?.visitTitle ?? "Visit"
    const footerVisitLines = props.footer?.visitLines?.length
      ? props.footer.visitLines
      : [
          "1280 Silverado Trail North",
          "Napa, CA 94558",
          "(707) 555-0192",
          "concierge@terroirandoak.com",
        ]
    const footerHoursTitle = props.footer?.hoursTitle ?? "Hours"
    const footerHoursLines = props.footer?.hoursLines?.length
      ? props.footer.hoursLines
      : ["Thursday–Monday", "10:00am – 5:00pm", "Tuesday–Wednesday", "By Appointment"]
    const footerLinksTitle = props.footer?.linksTitle ?? "Quick Links"
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Our Story", "Wines", "Tastings", "Wine Club", "Careers", "Press"]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Estate Winery. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Age Verification"]

    // Estate wine-glass brand mark (decorative inline SVG).
    const GlassMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 40 40"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M20 2C16 2 12 6 12 12v8c0 4-2 8-6 12 0 0 4 6 14 6s14-6 14-6c-4-4-6-8-6-12v-8c0-6-4-10-8-10z" />
        <ellipse cx="20" cy="38" rx="10" ry="2" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // estate grown — grape / chalice tray
      <svg
        key="estate"
        className="size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
      // time honored — clock
      <svg
        key="time"
        className="size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      // sustainable — globe / leaf network
      <svg
        key="sustainable"
        className="size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
    ]

    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const Bolt = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    const visitIcons: ReactNode[] = [
      // pin
      <svg
        key="pin"
        className="size-5 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>,
      // clock
      <svg
        key="hours"
        className="size-5 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      // phone
      <svg
        key="contact"
        className="size-5 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>,
    ]
    const visitInfo = [
      { title: "Address", lines: visitAddress },
      { title: "Hours", lines: visitHours },
      { title: "Contact", lines: visitContact },
    ]

    const socials = ["Instagram", "Facebook", "Twitter"] as const
    const socialPaths: Record<(typeof socials)[number], string> = {
      Instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      Facebook:
        "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      Twitter:
        "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
    }

    const inputCls =
      "w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3 text-left"
                aria-label={`${brand} home`}
              >
                <GlassMark className="size-10 text-primary" />
                <span className="flex flex-col">
                  <span className="text-xl font-light tracking-wider text-foreground">
                    {brand.toUpperCase()}
                  </span>
                  <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:block">
                    Estate Winery
                  </span>
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(heroBook)}
                  className="bg-primary px-6 py-2.5 text-sm uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroBook}
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground md:hidden"
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
          </nav>
        </header>

        <main>
          {/* Hero */}
          <header className="relative flex min-h-screen items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-background">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-background/80">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight sm:text-6xl md:text-7xl">
                {heroTop}
                <br />
                {heroBottom}
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-background/80 sm:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="bg-background px-8 py-4 text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="border border-background px-8 py-4 text-sm uppercase tracking-wider text-background transition-colors hover:bg-background/10"
                >
                  {heroSecondary}
                </button>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/60">
              <svg
                className="size-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </header>

          {/* Features */}
          <section className="bg-card py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 text-center md:grid-cols-3">
                {features.map((feature, i) => (
                  <div key={feature.title} className="group">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted text-primary transition-colors group-hover:bg-primary/10">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-lg font-medium text-card-foreground">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <Image
                      alt={storyImage1}
                      w={600}
                      h={500}
                      loading="lazy"
                      className="h-64 w-full rounded-sm object-cover"
                    />
                    <Image
                      alt={storyImage2}
                      w={600}
                      h={500}
                      loading="lazy"
                      className="mt-8 h-64 w-full rounded-sm object-cover"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-6 -right-6 -z-10 size-48 rounded-sm bg-primary/10"
                  />
                </div>
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                    {storyEyebrow}
                  </p>
                  <h2 className="mb-6 text-4xl font-light leading-tight text-foreground sm:text-5xl">
                    {storyTop}
                    <br />
                    {storyBottom}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {storyParagraphs.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-8 border-t border-border pt-8">
                    {storyStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-light text-primary">
                          {s.value}
                        </p>
                        <p className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {galleryEyebrow}
                </p>
                <h2 className="text-4xl font-light text-card-foreground sm:text-5xl">
                  {galleryHeading}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[0, 1, 2, 3].map((col) => (
                  <div
                    key={col}
                    className={cn("space-y-4", col % 2 === 1 && "pt-8")}
                  >
                    {[galleryAlts[col * 2], galleryAlts[col * 2 + 1]].map(
                      (alt, j) =>
                        alt ? (
                          <Image
                            key={alt}
                            alt={alt}
                            w={600}
                            h={j === 0 ? 384 : 512}
                            loading="lazy"
                            className={cn(
                              "w-full rounded-sm object-cover transition-opacity hover:opacity-90",
                              j === 0 ? "h-48" : "h-64",
                            )}
                          />
                        ) : null,
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-5xl font-light text-primary-foreground">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-wide text-background/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Wines */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {winesEyebrow}
                </p>
                <h2 className="mb-6 text-4xl font-light text-foreground sm:text-5xl">
                  {winesHeading}
                </h2>
                <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
                  {winesDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {wineItems.map((wine) => (
                  <button
                    key={wine.name}
                    type="button"
                    onClick={() => go(wine.name)}
                    className="rounded-sm border border-border bg-card p-8 text-left transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider text-primary">
                        {wine.vintage}
                      </span>
                      <span className="text-2xl font-light text-card-foreground">
                        {wine.price}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-card-foreground">
                      {wine.name}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {wine.notes}
                    </p>
                    <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bolt />
                        {wine.abv}
                      </span>
                      <span>{wine.size}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Tastings */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                    {tastingsEyebrow}
                  </p>
                  <h2 className="mb-6 text-4xl font-light text-card-foreground sm:text-5xl">
                    {tastingsHeading}
                  </h2>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {tastingsDesc}
                  </p>
                  <div className="space-y-6">
                    {tastingSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          <span className="font-medium text-primary">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium text-card-foreground">
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  {tastingOptions.map((option) => (
                    <div
                      key={option.name}
                      className={cn(
                        "rounded-sm p-8",
                        option.featured
                          ? "bg-foreground text-background"
                          : "border border-border bg-muted",
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3
                            className={cn(
                              "mb-1 text-xl font-medium",
                              option.featured
                                ? "text-background"
                                : "text-foreground",
                            )}
                          >
                            {option.name}
                          </h3>
                          <p
                            className={cn(
                              "text-sm",
                              option.featured
                                ? "text-background/60"
                                : "text-muted-foreground",
                            )}
                          >
                            {option.meta}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-2xl font-light",
                            option.featured
                              ? "text-primary-foreground"
                              : "text-primary",
                          )}
                        >
                          {option.price}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mb-4",
                          option.featured
                            ? "text-background/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {option.description}
                      </p>
                      <ul
                        className={cn(
                          "mb-6 space-y-2 text-sm",
                          option.featured
                            ? "text-background/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {option.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <Check
                              className={
                                option.featured
                                  ? "text-primary-foreground"
                                  : "text-primary"
                              }
                            />
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(option.cta)}
                        className={cn(
                          "w-full rounded-sm py-3 text-sm uppercase tracking-wider transition-colors",
                          option.featured
                            ? "bg-background text-foreground hover:bg-muted"
                            : "bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        {option.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {testimonialsEyebrow}
                </p>
                <h2 className="text-4xl font-light text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-sm border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Visit */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                    {visitEyebrow}
                  </p>
                  <h2 className="mb-6 text-4xl font-light text-card-foreground sm:text-5xl">
                    {visitHeading}
                  </h2>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {visitDesc}
                  </p>

                  <div className="mb-8 space-y-6">
                    {visitInfo.map((info, i) => (
                      <div key={info.title} className="flex items-start gap-4">
                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {visitIcons[i % visitIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium text-card-foreground">
                            {info.title}
                          </h4>
                          <p className="text-muted-foreground">
                            {info.lines.map((line, j) => (
                              <span key={line}>
                                {j > 0 && <br />}
                                {line}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-sm border border-border bg-muted p-6">
                    <h4 className="mb-3 font-medium text-card-foreground">
                      {directionsTitle}
                    </h4>
                    {directions.map((d, i) => (
                      <p
                        key={d.slice(0, 24)}
                        className={cn(
                          "text-sm text-muted-foreground",
                          i > 0 && "mt-4",
                        )}
                      >
                        {d}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-sm border border-border bg-card p-8 shadow-sm">
                  <h3 className="mb-6 text-xl font-medium text-card-foreground">
                    {formTitle}
                  </h3>
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(visitSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="winery-first"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="winery-first"
                          type="text"
                          required
                          placeholder="Jane"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="winery-last"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="winery-last"
                          type="text"
                          required
                          placeholder="Smith"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="winery-email"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="winery-email"
                        type="email"
                        required
                        placeholder="jane@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="winery-phone"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        id="winery-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="winery-date"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          Preferred Date
                        </label>
                        <input
                          id="winery-date"
                          type="date"
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="winery-guests"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          Number of Guests
                        </label>
                        <select
                          id="winery-guests"
                          required
                          className={cn(inputCls, "appearance-none")}
                        >
                          <option className="bg-background">Select...</option>
                          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} className="bg-background">
                              {n} guests
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="winery-experience"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Experience
                      </label>
                      <select
                        id="winery-experience"
                        required
                        className={cn(inputCls, "appearance-none")}
                      >
                        {experienceOptions.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="winery-notes"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Special Requests
                      </label>
                      <textarea
                        id="winery-notes"
                        rows={3}
                        placeholder="Dietary restrictions, celebration details, accessibility needs..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-sm bg-primary py-4 text-sm font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {visitSubmit}
                    </button>
                    <p className="text-center text-xs text-muted-foreground">
                      {visitFinePrint}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Wine club CTA */}
          <section className="relative py-24">
            <div className="absolute inset-0 z-0">
              <Image
                alt={clubImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/80" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-background">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-background/70">
                {clubEyebrow}
              </p>
              <h2 className="mb-6 text-4xl font-light leading-tight sm:text-5xl">
                {clubHeading}
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-background/80">
                {clubDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(clubPrimary)}
                  className="bg-background px-8 py-4 text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                >
                  {clubPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(clubSecondary)}
                  className="border border-background px-8 py-4 text-sm uppercase tracking-wider text-background transition-colors hover:bg-background/10"
                >
                  {clubSecondary}
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">
                  {faqEyebrow}
                </p>
                <h2 className="text-4xl font-light text-foreground sm:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-sm border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3 text-left"
                  aria-label={`${brand} home`}
                >
                  <GlassMark className="size-10 text-primary" />
                  <span className="text-xl font-light tracking-wider text-background">
                    {brand.toUpperCase()}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={socialPaths[social]} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-background">
                  {footerVisitTitle}
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerVisitLines.map((line, i) => (
                    <li key={line} className={cn(i === 2 && "pt-2")}>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-background">
                  {footerHoursTitle}
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerHoursLines.map((line, i) => (
                    <li key={line} className={cn(i === 2 && "pt-2")}>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-background">
                  {footerLinksTitle}
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerLinks.map((link) => (
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-background/50">
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
