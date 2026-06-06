import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BakeryKimiPage — a complete, self-contained artisan-bakery LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Flour & Stone" design: a
 * warm, editorial, light aesthetic with serif display headings, stone/amber
 * mapped to neutral + primary tokens, and a craft-forward "slow bread" mood.
 * It pairs a split hero (eyebrow + serif headline + dual CTAs + open-hours/
 * address chips + a floating "Certified Organic" card over a hero photo) with
 * a press logos strip, a 3-up "why our bread is different" feature trio, a
 * full daily menu (breads + pastries columns plus a cakes/specials grid with
 * prices), a 3-step "how to order" guide, a masonry bakery gallery, a dark
 * stats band, a 3-up review/testimonial grid, an accordion FAQ, a dark order
 * CTA with a photo, a visit/contact block with address + hours + a map
 * placeholder, and a rich footer with social + newsletter signup.
 *
 * Every nav item / CTA / footer link / social / newsletter submit routes
 * through `useNavigate` (never a dead "#"). All photography (hero, gallery,
 * reviewer headshots, CTA basket) uses the alt-driven <Image> component.
 * Callers supply ONLY content; rich defaults make it render great with no
 * props at all.
 */
export const BakeryKimiPage = defineComponent({
  name: "BakeryKimiPage",
  description:
    "Complete artisan-bakery / craft-bread shop LANDING page with a warm, editorial, light aesthetic: serif display headings, neutral stone surfaces, amber-mapped primary accents, and a slow-fermentation craft mood. Includes a split hero (Est. eyebrow, serif headline, dual CTAs, open-hours + address chips, floating Certified-Organic badge over a sourdough photo), a press/featured-in logo strip, a 3-up 'why our bread is different' feature trio with icons, a full daily menu (Artisan Breads and Pastries columns plus a Cakes & Special Orders grid, each item priced), a 3-step 'how to order' guide (pre-order / call / walk-in), a masonry bakery gallery, a dark stats band, a 3-up 5-star review grid with headshots, an accordion FAQ, a dark 'ready to order' CTA with a bread-basket photo, a visit/contact block with address + hours + contact + parking and a map placeholder, and a footer with social links and a newsletter signup. Use as the ROOT/home page for bakeries, patisseries, sourdough / artisan-bread shops, cafes, pastry kitchens, dessert and cake studios, coffee-and-bake spots, or any local food maker wanting a cozy, premium, conversion-focused site with menu, ordering, gallery and social proof. Supply content only — brand, nav, hero, features, menu, steps, gallery, stats, testimonials, faq, cta, visit, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / bakery name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        hoursChip: z.string().optional(),
        addressChip: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
      })
      .optional(),
    /** Press / featured-in logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why our bread is different" feature trio. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Daily menu: two priced columns + a cakes/specials grid. */
    menu: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        breadsTitle: z.string().optional(),
        breadsEmoji: z.string().optional(),
        breads: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        pastriesTitle: z.string().optional(),
        pastriesEmoji: z.string().optional(),
        pastries: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        cakesTitle: z.string().optional(),
        cakesEmoji: z.string().optional(),
        cakes: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How to order" 3-step guide. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Masonry bakery gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
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
    /** Review / testimonial grid. */
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
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark "ready to order" CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        button: z.string().optional(),
        phoneLabel: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Visit / contact block. */
    visit: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), lines: z.array(z.string()) }))
          .optional(),
        mapLabel: z.string().optional(),
        mapSub: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        newsletterTitle: z.string().optional(),
        newsletterText: z.string().optional(),
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
    const brand = props.brand ?? "Flour & Stone"
    const nav = props.nav?.length
      ? props.nav
      : ["Menu", "Our Story", "Gallery", "Order", "Visit"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2018 — Portland, Oregon"
    const heroHeading =
      props.hero?.heading ??
      "Artisan breads & pastries baked daily with stone-milled flour"
    const heroSub =
      props.hero?.subheading ??
      "Every loaf tells a story of slow fermentation, organic grains, and time-honored techniques. From our signature sourdough to buttery croissants, we craft each item with intention and care."
    const heroPrimary = props.hero?.primaryCta ?? "Order for Pickup"
    const heroSecondary = props.hero?.secondaryCta ?? "Visit Our Bakery"
    const heroHours = props.hero?.hoursChip ?? "Open 7am–4pm Daily"
    const heroAddress = props.hero?.addressChip ?? "1423 Oak Street"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Golden crusty artisan sourdough bread loaves arranged on a wooden cutting board in a sunlit bakery"
    const heroBadgeTitle = props.hero?.badgeTitle ?? "Certified Organic"
    const heroBadgeSub = props.hero?.badgeSubtitle ?? "Stone-milled grains"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Portland Monthly", "Eater PDX", "Bon Appétit", "The Oregonian", "Food & Wine"]

    const featuresHeading =
      props.features?.heading ?? "Why our bread is different"
    const featuresDesc =
      props.features?.description ??
      "We believe great bread takes time. Our 36-hour fermentation process develops complex flavors that mass-produced bread simply cannot match."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Local Grains",
            description:
              "We partner with Camas Country Mill in Eugene for organic wheat, rye, and spelt. Our flour travels less than 100 miles from field to bakery.",
          },
          {
            title: "Slow Fermentation",
            description:
              "Our sourdough levain matures for 12 hours before mixing. Each loaf undergoes a full 36-hour cold ferment for optimal flavor and digestibility.",
          },
          {
            title: "No Shortcuts",
            description:
              "No commercial yeast, no dough conditioners, no preservatives. Just flour, water, salt, and time. The way bread has been made for millennia.",
          },
        ]

    const menuHeading = props.menu?.heading ?? "Our Daily Menu"
    const menuDesc =
      props.menu?.description ??
      "Available from 7am until sold out. Call ahead for large orders or custom cakes."
    const breadsTitle = props.menu?.breadsTitle ?? "Artisan Breads"
    const breadsEmoji = props.menu?.breadsEmoji ?? "🍞"
    const breads = props.menu?.breads?.length
      ? props.menu.breads
      : [
          { name: "Country Sourdough", description: "Organic wheat, 36-hour ferment, crispy crust", price: "$9" },
          { name: "Seeded Multigrain", description: "Sunflower, sesame, flax, and pumpkin seeds", price: "$10" },
          { name: "Rustic Rye", description: "70% rye flour, caraway, molasses", price: "$9" },
          { name: "Olive & Herb Fougasse", description: "Kalamata olives, rosemary, sea salt", price: "$8" },
          { name: "Baguette Tradition", description: "Classic French style, crackling crust", price: "$5" },
          { name: "Cinnamon Raisin Swirl", description: "Overnight-soaked raisins, Ceylon cinnamon", price: "$10" },
        ]
    const pastriesTitle = props.menu?.pastriesTitle ?? "Pastries & Viennoiserie"
    const pastriesEmoji = props.menu?.pastriesEmoji ?? "🥐"
    const pastries = props.menu?.pastries?.length
      ? props.menu.pastries
      : [
          { name: "Butter Croissant", description: "Laminated with European-style butter, 27 layers", price: "$4.50" },
          { name: "Chocolate Almond Croissant", description: "Double-baked with Valrhona chocolate frangipane", price: "$5.50" },
          { name: "Kouign-Amann", description: "Breton specialty, caramelized sugar crust", price: "$5" },
          { name: "Morning Bun", description: "Orange zest, cinnamon, caramelized exterior", price: "$4.50" },
          { name: "Seasonal Fruit Danish", description: "Current: Oregon berry compote with vanilla cream", price: "$5" },
          { name: "Canelé de Bordeaux", description: "Rum and vanilla custard, dark caramelized shell", price: "$4" },
        ]
    const cakesTitle = props.menu?.cakesTitle ?? "Cakes & Special Orders"
    const cakesEmoji = props.menu?.cakesEmoji ?? "🎂"
    const cakes = props.menu?.cakes?.length
      ? props.menu.cakes
      : [
          { name: "Whole Wheat Sandwich Loaf", description: "Soft crumb, honey-sweetened, sliced", price: "$7" },
          { name: "Brioche Hamburger Buns (4)", description: "Buttery, sesame-crusted, bakery favorite", price: "$8" },
          { name: "Flourless Chocolate Cake", description: "6-inch, ganache glaze (48hr notice)", price: "$38" },
          { name: "Tarte Tatin", description: "Caramelized apple, puff pastry (weekends only)", price: "$32" },
          { name: "Seasonal Fruit Galette", description: "9-inch, rustic free-form tart", price: "$28" },
          { name: "Custom Celebration Cake", description: "Consultation required, 1 week notice", price: "From $75" },
        ]

    const stepsHeading = props.steps?.heading ?? "How to order"
    const stepsDesc =
      props.steps?.description ??
      "Three simple ways to get your hands on fresh bread."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Pre-order online",
            description:
              "Reserve your favorites by 6pm the day before. Pick up anytime during business hours. Guaranteed availability.",
            note: "Best for: Large orders, special items, busy weekends",
          },
          {
            title: "Call ahead",
            description:
              "Phone in your order for same-day pickup. We set aside your items and have them ready at the counter.",
            note: "(503) 555-0142",
          },
          {
            title: "Walk in",
            description:
              "Visit us at 1423 Oak Street. First come, first served. Popular items often sell out by midday.",
            note: "Open 7am–4pm daily",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Inside the bakery"
    const galleryDesc =
      props.gallery?.description ??
      "A glimpse into our daily process, from mixing to the final loaf."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Baker's hands shaping round sourdough bread boules on a floured wooden work surface",
          "Close-up of golden brown artisan bread crust showing detailed scoring pattern",
          "Rows of fresh buttery croissants cooling on a wire rack in a bakery kitchen",
          "Rustic bakery interior with wooden shelves displaying various artisan bread loaves",
          "Freshly baked sourdough bread loaves with dark crusty exterior arranged on linen",
          "Baker mixing bread dough in a large stainless steel bowl with flour",
          "Assorted colorful French macarons displayed in a glass case at a pastry shop",
          "Decorated layered chocolate cake with frosting and fresh berries on a cake stand",
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "6+", label: "Years baking" },
          { value: "200+", label: "Loaves daily" },
          { value: "36", label: "Hour ferment" },
          { value: "3", label: "Local grain farms" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What our neighbors say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Reviews from regulars who make Flour & Stone part of their routine."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've been coming here every Saturday for three years. The seeded multigrain is the only bread my kids will eat. You can taste the difference real fermentation makes.",
            name: "Sarah Chen",
            role: "Regular since 2021",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "Ordered a custom cake for my daughter's birthday. Not only was it beautiful, but the flavor was incredible. The flourless chocolate cake is now our family tradition.",
            name: "Marcus Thompson",
            role: "Catering client",
            avatarAlt:
              "Professional headshot of a smiling middle-aged man with glasses and short gray hair",
          },
          {
            quote:
              "As a chef myself, I'm picky about bread. This is the real deal. The fermentation, the crust, the chew—everything is textbook perfect. I send all my friends here.",
            name: "Elena Rodriguez",
            role: "Chef at La Maison",
            avatarAlt:
              "Professional headshot of a smiling woman with curly dark hair wearing a white chef coat",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ??
      "Quick answers to the questions we hear most often."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do I need to pre-order, or can I just walk in?",
            answer:
              "Walk-ins are always welcome! However, popular items like our kouign-amann and chocolate almond croissants often sell out by 10am on weekends. For large orders (6+ items) or special cakes, we recommend pre-ordering online or calling ahead.",
          },
          {
            question: "How far in advance should I order a custom cake?",
            answer:
              "We require at least one week's notice for custom celebration cakes. During holiday periods (Thanksgiving, Christmas, Valentine's Day), we recommend booking 2-3 weeks ahead as our calendar fills quickly.",
          },
          {
            question: "Do you offer gluten-free or vegan options?",
            answer:
              "We bake a limited selection of gluten-free items daily—check our online menu for today's offerings. Please note that all products are made in a facility that processes wheat, so we cannot guarantee items are celiac-safe. We do not currently offer vegan pastries.",
          },
          {
            question: "Can you deliver or ship bread?",
            answer:
              "We offer local delivery within 5 miles of the bakery for orders over $50. Unfortunately, we do not ship bread—freshness is too important to us. If you're visiting from out of town, grab a loaf to take home; most breads keep well for 3-4 days or freeze beautifully.",
          },
          {
            question: "Do you wholesale to restaurants?",
            answer:
              "Yes, we partner with a select group of local restaurants and cafes. Our wholesale clients include Tusk, Ava Gene's, and Coquine. For wholesale inquiries, please email us at wholesale@flourandstone.com with details about your establishment and volume needs.",
          },
          {
            question: "What's the best way to store your bread?",
            answer:
              "Keep your loaf cut-side down on a cutting board (uncovered) for up to 3 days. For longer storage, wrap tightly in plastic and freeze for up to 3 months. Never refrigerate bread—it accelerates staling. To revive a loaf, spritz with water and bake at 375°F for 8-10 minutes.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to order?"
    const ctaDesc =
      props.cta?.description ??
      "Pre-order by 6pm today for guaranteed pickup tomorrow. Skip the line and reserve your favorites."
    const ctaButton = props.cta?.button ?? "Start Your Order"
    const ctaPhoneLabel = props.cta?.phoneLabel ?? "or call us at"
    const ctaPhone = props.cta?.phone ?? "(503) 555-0142"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Wicker basket filled with assorted fresh artisan breads on a bakery counter"

    const visitHeading = props.visit?.heading ?? "Visit us"
    const visitItems = props.visit?.items?.length
      ? props.visit.items
      : [
          {
            title: "Address",
            lines: [
              "1423 Oak Street",
              "Portland, OR 97205",
              "Corner of Oak & 15th, Buckman neighborhood",
            ],
          },
          {
            title: "Hours",
            lines: [
              "Tuesday–Sunday: 7am – 4pm",
              "Monday: Closed",
              "Kitchen opens at 6am for prep",
            ],
          },
          {
            title: "Contact",
            lines: ["(503) 555-0142", "hello@flourandstone.com"],
          },
          {
            title: "Parking",
            lines: [
              "Street parking available on Oak St. and 15th Ave.",
              "Free 2-hour parking in the lot behind the building.",
            ],
          },
        ]
    const mapLabel = props.visit?.mapLabel ?? "Map placeholder"
    const mapSub = props.visit?.mapSub ?? "1423 Oak Street, Portland, OR"

    const footerTagline =
      props.footer?.tagline ??
      "Artisan breads and pastries baked daily in Portland, Oregon since 2018."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Shop", links: ["Daily Menu", "Special Orders", "Wholesale", "Gift Cards"] },
          { title: "Company", links: ["Our Story", "Grain Partners", "Careers", "Press"] },
        ]
    const newsletterTitle = props.footer?.newsletterTitle ?? "Newsletter"
    const newsletterText =
      props.footer?.newsletterText ?? "Get weekly menu updates and baking tips."
    const newsletterCta = props.footer?.newsletterCta ?? "Join"
    const copyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Bakery. All rights reserved.`
    const legalLinks = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const ArrowRight = () => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ClockIcon = () => (
      <svg
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const PinIcon = () => (
      <svg
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const PhoneIcon = () => (
      <svg
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const InfoIcon = () => (
      <svg
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
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // wheat / grains
      <svg
        key="grain"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
      // clock / fermentation
      <ClockIcon key="clock" />,
      // check shield / no shortcuts
      <svg
        key="check"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const stepIcons: ReactNode[] = [
      // device / online
      <svg
        key="device"
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
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      <PhoneIcon key="phone" />,
      <PinIcon key="pin" />,
    ]

    const StarRow = () => (
      <div className="mb-4 flex gap-1 text-primary" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    const PriceRow = ({
      item,
    }: {
      item: { name: string; description: string; price: string }
    }) => (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-card-foreground">{item.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </div>
        <span className="font-semibold text-card-foreground">{item.price}</span>
      </div>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground lg:text-2xl"
              >
                {brand}
              </button>
              <nav className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Order")}
                  className="hidden items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
                >
                  Order Online
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
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
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-wider text-primary">
                      {heroEyebrow}
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                      {heroHeading}
                    </h1>
                    <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                      {heroSub}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go("Order")}
                      className="inline-flex items-center rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                      <span className="ml-2">
                        <ArrowRight />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go("Visit")}
                      className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-card"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        <ClockIcon />
                      </span>
                      <span>{heroHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        <PinIcon />
                      </span>
                      <span>{heroAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="h-[400px] w-full rounded-xl object-cover shadow-xl lg:h-[500px]"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroBadgeSub}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-b border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="space-y-4 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-xl bg-muted text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Menu */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {menuHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{menuDesc}</p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="rounded-xl bg-card p-8 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                      {breadsEmoji}
                    </span>
                    {breadsTitle}
                  </h3>
                  <div className="space-y-6">
                    {breads.map((item) => (
                      <PriceRow key={item.name} item={item} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-card p-8 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                      {pastriesEmoji}
                    </span>
                    {pastriesTitle}
                  </h3>
                  <div className="space-y-6">
                    {pastries.map((item) => (
                      <PriceRow key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-card p-8 shadow-sm">
                <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-card-foreground">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-lg">
                    {cakesEmoji}
                  </span>
                  {cakesTitle}
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {cakes.map((item) => (
                    <PriceRow key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="absolute -left-2 -top-4 text-6xl font-bold text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative h-full rounded-xl bg-muted p-8">
                      <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                        {stepIcons[i % stepIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {step.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[0, 1, 2, 3].map((col) => (
                  <div key={col} className="space-y-4">
                    <Image
                      alt={galleryItems[col * 2 % galleryItems.length]}
                      w={400}
                      h={500}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        col % 2 === 0 ? "h-64" : "h-48",
                      )}
                    />
                    <Image
                      alt={galleryItems[(col * 2 + 1) % galleryItems.length]}
                      w={400}
                      h={col % 2 === 0 ? 300 : 500}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        col % 2 === 0 ? "h-48" : "h-64",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl font-bold text-primary lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-background/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-xl bg-muted p-8">
                    <StarRow />
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-lg bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-180">
                        <svg
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
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Order CTA */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-xl bg-foreground text-background">
                <div className="grid lg:grid-cols-2">
                  <div className="flex flex-col justify-center p-8 lg:p-16">
                    <h2 className="mb-4 text-3xl font-semibold lg:text-4xl">
                      {ctaHeading}
                    </h2>
                    <p className="mb-8 text-lg leading-relaxed text-background/70">
                      {ctaDesc}
                    </p>
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => go("Order")}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                      >
                        <span className="mr-2">
                          <svg
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
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </span>
                        {ctaButton}
                      </button>
                      <p className="text-sm text-background/60">
                        {ctaPhoneLabel}{" "}
                        <button
                          type="button"
                          onClick={() => go(ctaPhone)}
                          className="text-primary transition-colors hover:text-primary/80"
                        >
                          {ctaPhone}
                        </button>
                      </p>
                    </div>
                  </div>
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      alt={ctaImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent lg:bg-gradient-to-l"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Visit */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="mb-6 text-3xl font-semibold text-foreground lg:text-4xl">
                    {visitHeading}
                  </h2>
                  <div className="space-y-6">
                    {visitItems.map((item, i) => {
                      const visitIcons = [
                        <PinIcon key="p" />,
                        <ClockIcon key="c" />,
                        <PhoneIcon key="ph" />,
                        <InfoIcon key="i" />,
                      ]
                      return (
                        <div key={item.title} className="flex items-start gap-4">
                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                            {visitIcons[i % visitIcons.length]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {item.title}
                            </h3>
                            {item.lines.map((line, li) => (
                              <p
                                key={line}
                                className={cn(
                                  li === item.lines.length - 1 && item.lines.length > 1
                                    ? "mt-1 text-sm text-muted-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex h-80 items-center justify-center rounded-xl bg-accent lg:h-96">
                  <div className="text-center text-muted-foreground">
                    <span className="mx-auto mb-4 block w-fit opacity-50">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <p className="text-lg font-medium">{mapLabel}</p>
                    <p className="mt-1 text-sm">{mapSub}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-1">
                <span className="text-2xl font-semibold tracking-tight text-background">
                  {brand}
                </span>
                <p className="mt-4 text-sm leading-relaxed">{footerTagline}</p>
                <div className="mt-6 flex gap-4">
                  {(["Instagram", "Facebook"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      {social === "Instagram" ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
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
              ))}

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {newsletterTitle}
                </h4>
                <p className="mb-4 text-sm">{newsletterText}</p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(newsletterCta)
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    aria-label="Your email"
                    className="flex-1 rounded-lg border border-input bg-background/10 px-4 py-2 text-background placeholder-background/50 focus:border-ring focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {newsletterCta}
                  </button>
                </form>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 text-sm md:flex-row">
              <p>{copyright}</p>
              <div className="flex gap-6">
                {legalLinks.map((link) => (
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
