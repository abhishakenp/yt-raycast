import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FoodTruckKimiPage — a complete, self-contained gourmet FOOD-TRUCK / street-food
 * landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Curbside Kitchen" design: a
 * warm, editorial, cream-and-stone aesthetic with a chef-driven story, a rotating
 * seasonal menu, and a strong catering pitch. It pairs a split hero (location pill,
 * stacked headline, rating + hours, dish photo with a floating chef card) with a
 * 3-up "why us" feature strip, a multi-card seasonal MENU (tacos, bowls, burgers,
 * sides — each with priced items and V/VG/GF dietary tags), a weekly LOCATIONS
 * schedule grid with day tiles plus a private-events banner, a masonry food GALLERY,
 * a dark CATERING band with a real quote-request form, star testimonials with press
 * logos, a stats strip, an accordion FAQ, a contact CTA, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and styling. Colors map to
 * semantic theme tokens only (cream/stone → background/muted/foreground, dark stone
 * bands → primary/foreground, day tiles rotate chart-1..5). Every nav item / CTA /
 * link / form submit routes through `useNavigate` (never a dead "#"). All imagery
 * uses the alt-driven <Image> component (never a raw src). Rich defaults make it
 * render the full page with no props at all.
 */
export const FoodTruckKimiPage = defineComponent({
  name: "FoodTruckKimiPage",
  description:
    "Complete gourmet FOOD-TRUCK / street-food landing page with a warm, editorial cream-and-stone aesthetic. Includes a split hero (now-serving location pill, stacked chef-made headline, rating + open-hours, dish photo with a floating chef-owner card), a 3-up why-us feature strip (farm-to-street, dietary-friendly, catering), a rotating seasonal MENU with multiple priced cards (signature tacos, bowls & salads, burgers & sandwiches, sides & sweets) including V/VG/GF dietary labels, a weekly LOCATIONS schedule grid of day tiles with addresses and times plus a private-events banner, a masonry food GALLERY, a dark CATERING band with a real request-a-quote form (name, email, date, guest count, event type, message), star testimonials with press logos, a stats strip (tacos served, reviews, events catered, years), an accordion FAQ, a phone/email contact CTA, and a multi-column footer with menu/company/social links. Use as the ROOT/home page for food trucks, street-food vendors, taco/burger/bowl concepts, pop-up kitchens, catering businesses, or any chef-driven mobile-food brand wanting menu + locations + catering + social proof on one warm, appetizing page. Supply content only — brand, nav, hero, features, menu, locations, gallery, catering, testimonials, stats, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / food-truck name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading lines rendered stacked. */
        headingLines: z.array(z.string()).optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        hours: z.string().optional(),
        imageAlt: z.string().optional(),
        chefName: z.string().optional(),
        chefRole: z.string().optional(),
        chefAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** "Why us" feature strip. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Seasonal menu section. */
    menu: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        categories: z
          .array(
            z.object({
              title: z.string(),
              imageAlt: z.string(),
              badge: z.string().optional(),
              wide: z.boolean().optional(),
              items: z.array(
                z.object({
                  name: z.string(),
                  description: z.string(),
                  price: z.string(),
                  tag: z.string().optional(),
                }),
              ),
            }),
          )
          .optional(),
        legend: z.array(z.string()).optional(),
      })
      .optional(),
    /** Weekly locations schedule. */
    locations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z
          .array(
            z.object({
              initial: z.string(),
              day: z.string(),
              area: z.string(),
              rows: z.array(z.object({ label: z.string(), value: z.string() })),
            }),
          )
          .optional(),
        bannerTitle: z.string().optional(),
        bannerNote: z.string().optional(),
        bannerCta: z.string().optional(),
      })
      .optional(),
    /** Food gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark catering band + request-a-quote form. */
    catering: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        options: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        tags: z.array(z.string()).optional(),
        formTitle: z.string().optional(),
        guestCounts: z.array(z.string()).optional(),
        eventTypes: z.array(z.string()).optional(),
        submit: z.string().optional(),
      })
      .optional(),
    /** Testimonials + press logos. */
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
        pressLogos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Stats strip. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Contact CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        emailCta: z.string().optional(),
        phoneCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Curbside Kitchen"
    const nav = props.nav?.length
      ? props.nav
      : ["Menu", "Locations", "Catering", "FAQ", "Book Catering"]

    const heroBadge = props.hero?.badge ?? "Now serving Los Angeles"
    const heroHeadingLines = props.hero?.headingLines?.length
      ? props.hero.headingLines
      : ["Street food.", "Chef-made.", "Served fresh."]
    const heroSub =
      props.hero?.subheading ??
      "Chef Marcus Chen brings 15 years of fine dining experience to the streets. Seasonal ingredients, bold flavors, zero pretension."
    const heroPrimary = props.hero?.primaryCta ?? "View Today's Menu"
    const heroSecondary = props.hero?.secondaryCta ?? "Find Us"
    const heroRating = props.hero?.rating ?? "4.9/5 (2,847 reviews)"
    const heroHours = props.hero?.hours ?? "Open today 11am–8pm"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Gourmet tacos being prepared on a food truck griddle with fresh ingredients"
    const chefName = props.hero?.chefName ?? "Chef Marcus Chen"
    const chefRole = props.hero?.chefRole ?? "Executive Chef & Owner"
    const chefAvatarAlt =
      props.hero?.chefAvatarAlt ??
      "Professional headshot of Chef Marcus Chen in his kitchen uniform"

    const features = props.features?.length
      ? props.features
      : [
          {
            title: "Farm-to-Street",
            description:
              "We source 80% of our ingredients from California farms within 150 miles. Seasonal menus change monthly.",
          },
          {
            title: "Dietary Friendly",
            description:
              "Extensive vegan, vegetarian, and gluten-free options. Every item clearly labeled with allergen info.",
          },
          {
            title: "Full-Service Catering",
            description:
              "From office lunches to weddings. We bring the truck or drop off platters. Serving up to 500 guests.",
          },
        ]

    const menuEyebrow = props.menu?.eyebrow ?? "June Menu"
    const menuHeading = props.menu?.heading ?? "What's Cooking"
    const menuDesc =
      props.menu?.description ??
      "Our menu rotates seasonally. Here's what we're serving this month."
    const menuCategories = props.menu?.categories?.length
      ? props.menu.categories
      : [
          {
            title: "Signature Tacos",
            badge: "Most Popular",
            imageAlt:
              "Korean short rib tacos with kimchi slaw on corn tortillas",
            items: [
              {
                name: "Korean Short Rib",
                description:
                  "Braised galbi, kimchi slaw, cilantro, gochujang crema",
                price: "$14",
              },
              {
                name: "Baja Fish",
                description: "Crispy cod, cabbage, pico, chipotle aioli (GF)",
                price: "$12",
              },
              {
                name: "Roasted Cauliflower",
                description:
                  "Tahini dressing, pickled onion, toasted almonds (V, GF)",
                price: "$11",
                tag: "VG",
              },
              {
                name: "Carnitas",
                description: "Slow-braised pork, salsa verde, queso fresco",
                price: "$13",
              },
            ],
          },
          {
            title: "Bowls & Salads",
            imageAlt:
              "Loaded grain bowl with quinoa, roasted vegetables, and tahini dressing",
            items: [
              {
                name: "Mediterranean Bowl",
                description:
                  "Quinoa, falafel, hummus, cucumber, tomato, tahini (V)",
                price: "$15",
                tag: "VG",
              },
              {
                name: "Poke Bowl",
                description:
                  "Sushi rice, ahi tuna, avocado, edamame, spicy mayo (GF)",
                price: "$16",
              },
              {
                name: "Grilled Chicken Caesar",
                description:
                  "Romaine, parmesan, sourdough croutons, house dressing",
                price: "$13",
              },
              {
                name: "Grain Bowl",
                description:
                  "Farro, roasted seasonal veg, lemon herb vinaigrette (V, GF)",
                price: "$14",
                tag: "VG",
              },
            ],
          },
          {
            title: "Burgers & Sandwiches",
            wide: true,
            imageAlt:
              "Handheld smash burger with melted cheese and caramelized onions",
            items: [
              {
                name: "Smash Burger",
                description:
                  "Double patty, american cheese, caramelized onions, special sauce",
                price: "$15",
              },
              {
                name: "Fried Chicken Sandwich",
                description: "Buttermilk brined, pickles, slaw, spicy honey",
                price: "$14",
              },
              {
                name: "Grilled Cheese",
                description:
                  "Sourdough, aged cheddar, gruyere, tomato soup dip",
                price: "$11",
                tag: "V",
              },
              {
                name: "BLT",
                description:
                  "Thick-cut bacon, heirloom tomato, butter lettuce, aioli",
                price: "$13",
              },
            ],
          },
          {
            title: "Sides & Sweets",
            imageAlt: "Assorted cookies and brownies on a rustic wooden board",
            items: [
              {
                name: "Truffle Fries",
                description: "Parmesan, truffle oil, herbs (V)",
                price: "$6",
              },
              {
                name: "Street Corn",
                description: "Elote style, cotija, chili, lime (V, GF)",
                price: "$5",
              },
              {
                name: "Daily Cookie",
                description: "Baked fresh each morning (V option)",
                price: "$4",
              },
            ],
          },
        ]
    const menuLegend = props.menu?.legend?.length
      ? props.menu.legend
      : ["VG = Vegan", "V = Vegetarian", "GF = Gluten-Free"]

    const locEyebrow = props.locations?.eyebrow ?? "Weekly Schedule"
    const locHeading = props.locations?.heading ?? "Find the Truck"
    const locDesc =
      props.locations?.description ??
      "We rotate through LA's best neighborhoods. Check our live location tracker on Instagram."
    const locDays = props.locations?.days?.length
      ? props.locations.days
      : [
          {
            initial: "M",
            day: "Monday",
            area: "Downtown Arts District",
            rows: [
              { label: "Location", value: "Traction Ave & 3rd" },
              { label: "Time", value: "11:00 AM – 2:30 PM" },
              { label: "Evening", value: "5:00 – 9:00 PM" },
            ],
          },
          {
            initial: "T",
            day: "Tuesday",
            area: "Culver City",
            rows: [
              { label: "Location", value: "Culver Steps Plaza" },
              { label: "Time", value: "11:00 AM – 2:30 PM" },
              { label: "Evening", value: "5:30 – 8:30 PM" },
            ],
          },
          {
            initial: "W",
            day: "Wednesday",
            area: "Santa Monica",
            rows: [
              { label: "Location", value: "Main St & Ocean Park" },
              { label: "Time", value: "11:00 AM – 3:00 PM" },
              { label: "Evening", value: "5:00 – 8:00 PM" },
            ],
          },
          {
            initial: "T",
            day: "Thursday",
            area: "Silver Lake",
            rows: [
              { label: "Location", value: "Sunset Junction" },
              { label: "Time", value: "11:30 AM – 2:30 PM" },
              { label: "Evening", value: "6:00 – 10:00 PM" },
            ],
          },
          {
            initial: "F",
            day: "Friday",
            area: "DTLA Financial District",
            rows: [
              { label: "Location", value: "7th & Figueroa" },
              { label: "Time", value: "11:00 AM – 2:30 PM" },
              { label: "Evening", value: "5:00 – 9:00 PM" },
            ],
          },
          {
            initial: "S",
            day: "Saturday",
            area: "Smorgasburg LA",
            rows: [
              { label: "Location", value: "Row DTLA" },
              { label: "Time", value: "10:00 AM – 4:00 PM" },
              { label: "Note", value: "All day event" },
            ],
          },
        ]
    const locBannerTitle =
      props.locations?.bannerTitle ?? "Sunday: Private Events Only"
    const locBannerNote =
      props.locations?.bannerNote ?? "Available for catering bookings"
    const locBannerCta = props.locations?.bannerCta ?? "Book Us"

    const galleryEyebrow = props.gallery?.eyebrow ?? "The Experience"
    const galleryHeading = props.gallery?.heading ?? "Gallery"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Close-up of chef plating gourmet street tacos with precision",
          "Vibrant fresh salad bowl with avocado and colorful vegetables",
          "Golden crispy fried chicken sandwich on brioche bun",
          "Food truck serving window with steam rising from fresh food",
          "Hand holding loaded fries with cheese and toppings",
          "Happy customers lining up at a food truck on a sunny day",
        ]

    const cateringEyebrow = props.catering?.eyebrow ?? "Private Events"
    const cateringHeading = props.catering?.heading ?? "Catering Services"
    const cateringDesc =
      props.catering?.description ??
      "Bring the Curbside Kitchen experience to your event. We handle everything from intimate gatherings to corporate celebrations up to 500 guests."
    const cateringOptions = props.catering?.options?.length
      ? props.catering.options
      : [
          {
            title: "Full-Service Truck",
            description:
              "We bring the full truck setup, cook fresh on-site, serve your guests",
          },
          {
            title: "Drop-Off Catering",
            description:
              "Pre-packed meals delivered hot, perfect for office lunches",
          },
          {
            title: "Buffet Setup",
            description:
              "Self-serve taco bars, bowl stations, full service included",
          },
        ]
    const cateringTags = props.catering?.tags?.length
      ? props.catering.tags
      : ["Corporate Events", "Weddings", "Birthdays", "Festivals"]
    const cateringFormTitle = props.catering?.formTitle ?? "Request a Quote"
    const guestCounts = props.catering?.guestCounts?.length
      ? props.catering.guestCounts
      : ["25-50", "50-100", "100-200", "200-500"]
    const eventTypes = props.catering?.eventTypes?.length
      ? props.catering.eventTypes
      : [
          "Corporate Lunch",
          "Wedding",
          "Birthday Party",
          "Festival / Public Event",
          "Other",
        ]
    const cateringSubmit = props.catering?.submit ?? "Request Quote"

    const testEyebrow = props.testimonials?.eyebrow ?? "Reviews"
    const testHeading = props.testimonials?.heading ?? "What People Say"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Had them cater our company lunch for 80 people. The Korean short rib tacos were the hit of the day. Everyone asked where we found them. Will definitely book again!",
            name: "Sarah Chen",
            role: "VP Marketing, TechFlow Inc.",
            avatarAlt:
              "Professional headshot of Sarah Chen, a marketing executive",
          },
          {
            quote:
              "Best food truck in LA hands down. I've been tracking them for months. The cauliflower tacos are so good I dream about them. Worth driving across town for.",
            name: "Marcus Johnson",
            role: "Food Blogger @LAEats",
            avatarAlt: "Professional headshot of Marcus Johnson, a food blogger",
          },
          {
            quote:
              "Hired them for my wedding reception. They were professional, punctual, and the food was absolutely incredible. Our guests are still talking about it three months later!",
            name: "Emily Rodriguez",
            role: "Wedding Client",
            avatarAlt: "Professional headshot of Emily Rodriguez, a bride",
          },
        ]
    const pressLogos = props.testimonials?.pressLogos?.length
      ? props.testimonials.pressLogos
      : ["Eater LA", "LA Times Food", "The Infatuation"]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "47k", label: "Tacos Served" },
          { value: "2,847", label: "5-Star Reviews" },
          { value: "156", label: "Events Catered" },
          { value: "4", label: "Years Running" },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "FAQ"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do you accommodate dietary restrictions?",
            a: "Absolutely. We have extensive vegan, vegetarian, and gluten-free options. Every menu item is clearly labeled, and our staff is trained on allergen protocols. For severe allergies, please let us know when ordering so we can take extra precautions.",
          },
          {
            q: "How do I book catering for an event?",
            a: "Fill out our catering form or email us at catering@curbsidekitchen.com with your event date, guest count, and preferred menu. We recommend booking at least 3 weeks in advance for weekends and 2 weeks for weekdays. We'll respond within 24 hours with a custom quote.",
          },
          {
            q: "Do you take reservations or pre-orders?",
            a: "We don't take reservations, but we do offer pre-ordering through our website for pickup windows. This is especially useful for lunch rushes in DTLA. Orders can be placed up to 24 hours in advance with a 15-minute pickup window.",
          },
          {
            q: "What forms of payment do you accept?",
            a: "We accept all major credit cards, Apple Pay, Google Pay, and cash. For catering events, we require a 50% deposit to secure the date with the balance due one week before the event.",
          },
          {
            q: "How do I know where the truck will be?",
            a: "We post our weekly schedule every Sunday evening on Instagram and our website. For real-time updates (traffic delays, sold out items), follow us on Instagram @curbsidekitchen where we share stories throughout the day.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to book the truck?"
    const ctaDesc =
      props.cta?.description ??
      "From office lunches to wedding receptions, we bring the flavor. Get in touch for a custom quote."
    const ctaEmail = props.cta?.emailCta ?? "Email Us"
    const ctaPhone = props.cta?.phoneCta ?? "(310) 555-1234"
    const ctaNote = props.cta?.note ?? "Typical response time: under 24 hours"

    const footerAbout =
      props.footer?.about ??
      "Gourmet food truck serving Los Angeles since 2020. Farm-to-street, chef-made, zero pretension."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Menu",
            links: [
              "Signature Tacos",
              "Bowls & Salads",
              "Burgers",
              "Sides & Sweets",
            ],
          },
          {
            title: "Company",
            links: ["Locations", "Catering", "FAQ", "Careers"],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "YouTube", "Facebook"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Food Safety"]

    const lastNav = nav[nav.length - 1]

    // Rotating accent tokens for decorative day tiles (no raw palette).
    const dayAccents = [
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
      "bg-primary/10 text-primary",
    ]

    // Decorative brand mark — initials of the brand name.
    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Chevron = () => (
      <svg
        className="size-5 transition-transform group-open:rotate-180"
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
    )

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span
                className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
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
                onClick={() => go(lastNav)}
                className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-foreground/90"
              >
                {lastNav}
              </button>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v: boolean) => !v)}
              className="p-2 text-muted-foreground md:hidden"
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
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </nav>
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
        </header>

        <main>
          {/* Hero */}
          <section className="px-6 pb-20 pt-32 md:pb-32 md:pt-40">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {heroBadge}
                </span>
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {heroHeadingLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-primary" />
                    {heroRating}
                  </span>
                  <span className="flex items-center gap-2">
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
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {heroHours}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={600}
                  className="h-[400px] w-full rounded-2xl object-cover md:h-[500px]"
                />
                <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg md:block">
                  <div className="flex items-center gap-3">
                    <Image
                      alt={chefAvatarAlt}
                      w={120}
                      h={120}
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {chefName}
                      </p>
                      <p className="text-xs text-muted-foreground">{chefRole}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="border-t border-border px-6 py-16">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="space-y-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
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
                        strokeWidth="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Menu */}
          <section className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 space-y-4 text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {menuEyebrow}
                </span>
                <h2 className="text-3xl font-bold md:text-4xl">{menuHeading}</h2>
                <p className="mx-auto max-w-lg text-muted-foreground">
                  {menuDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {menuCategories.map((cat) => (
                  <div
                    key={cat.title}
                    className={cn(cat.wide && "md:col-span-2")}
                  >
                    <Image
                      alt={cat.imageAlt}
                      w={800}
                      h={400}
                      loading="lazy"
                      className={cn(
                        "mb-6 w-full rounded-xl object-cover",
                        cat.wide ? "h-48" : "h-64",
                      )}
                    />
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                      {cat.title}
                      {cat.badge && (
                        <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                          {cat.badge}
                        </span>
                      )}
                    </h3>
                    <div
                      className={cn(
                        cat.wide ? "grid gap-4 sm:grid-cols-2" : "space-y-4",
                      )}
                    >
                      {cat.items.map((item, i) => (
                        <div
                          key={item.name}
                          className={cn(
                            "flex items-start justify-between gap-4",
                            i < cat.items.length - 1 &&
                              "border-b border-border pb-4",
                          )}
                        >
                          <div>
                            <p className="font-medium">
                              {item.name}
                              {item.tag && (
                                <span className="ml-1.5 text-xs font-medium text-chart-2">
                                  {item.tag}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <span className="font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center text-sm text-muted-foreground">
                {menuLegend.map((entry) => (
                  <span key={entry} className="inline-block">
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Locations */}
          <section className="bg-muted px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 space-y-4 text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {locEyebrow}
                </span>
                <h2 className="text-3xl font-bold md:text-4xl">{locHeading}</h2>
                <p className="mx-auto max-w-lg text-muted-foreground">
                  {locDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {locDays.map((d, i) => (
                  <div
                    key={d.day}
                    className="rounded-xl bg-card p-6 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "grid size-12 place-items-center rounded-lg font-bold",
                          dayAccents[i % dayAccents.length],
                        )}
                      >
                        {d.initial}
                      </div>
                      <div>
                        <h3 className="font-semibold">{d.day}</h3>
                        <p className="text-sm text-muted-foreground">{d.area}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {d.rows.map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-right font-medium">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-foreground p-6 text-background md:flex-row">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-background/10">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{locBannerTitle}</p>
                    <p className="text-sm text-background/70">{locBannerNote}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => go(locBannerCta)}
                  className="rounded-full bg-background px-6 py-2 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {locBannerCta}
                </button>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 space-y-4 text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {galleryEyebrow}
                </span>
                <h2 className="text-3xl font-bold md:text-4xl">
                  {galleryHeading}
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((col) => (
                  <div key={col} className="space-y-4">
                    <Image
                      alt={galleryAlts[col * 2] ?? galleryHeading}
                      w={400}
                      h={500}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        col === 1 ? "h-48" : "h-64",
                      )}
                    />
                    <Image
                      alt={galleryAlts[col * 2 + 1] ?? galleryHeading}
                      w={400}
                      h={400}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        col === 1 ? "h-64" : "h-48",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Catering */}
          <section className="bg-foreground px-6 py-20 text-background">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-12 md:grid-cols-2">
                <div className="space-y-6">
                  <span className="text-sm uppercase tracking-widest text-background/70">
                    {cateringEyebrow}
                  </span>
                  <h2 className="text-3xl font-bold md:text-4xl">
                    {cateringHeading}
                  </h2>
                  <p className="leading-relaxed text-background/80">
                    {cateringDesc}
                  </p>

                  <div className="space-y-4 pt-4">
                    {cateringOptions.map((opt) => (
                      <div key={opt.title} className="flex items-start gap-4">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-background/10">
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
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">{opt.title}</h4>
                          <p className="text-sm text-background/70">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    {cateringTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-background/10 px-3 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-card p-8 text-card-foreground">
                  <h3 className="mb-6 text-xl font-semibold">
                    {cateringFormTitle}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(cateringSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ft-name"
                          className="mb-1 block text-sm font-medium"
                        >
                          Name
                        </label>
                        <input
                          id="ft-name"
                          type="text"
                          placeholder="Your name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ft-email"
                          className="mb-1 block text-sm font-medium"
                        >
                          Email
                        </label>
                        <input
                          id="ft-email"
                          type="email"
                          placeholder="you@email.com"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ft-date"
                          className="mb-1 block text-sm font-medium"
                        >
                          Event Date
                        </label>
                        <input id="ft-date" type="date" className={inputCls} />
                      </div>
                      <div>
                        <label
                          htmlFor="ft-guests"
                          className="mb-1 block text-sm font-medium"
                        >
                          Guest Count
                        </label>
                        <select
                          id="ft-guests"
                          className={cn(inputCls, "appearance-none")}
                        >
                          {guestCounts.map((g) => (
                            <option key={g} className="bg-background">
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="ft-type"
                        className="mb-1 block text-sm font-medium"
                      >
                        Event Type
                      </label>
                      <select
                        id="ft-type"
                        className={cn(inputCls, "appearance-none")}
                      >
                        {eventTypes.map((t) => (
                          <option key={t} className="bg-background">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="ft-message"
                        className="mb-1 block text-sm font-medium"
                      >
                        Message
                      </label>
                      <textarea
                        id="ft-message"
                        rows={3}
                        placeholder="Tell us about your event..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {cateringSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 space-y-4 text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {testEyebrow}
                </span>
                <h2 className="text-3xl font-bold md:text-4xl">{testHeading}</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {testItems.map((t) => (
                  <div key={t.name} className="rounded-xl bg-muted p-6">
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} className="size-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                {pressLogos.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-bold text-foreground md:text-4xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-6 py-20">
            <div className="mx-auto max-w-3xl">
              <div className="mb-16 space-y-4 text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </span>
                <h2 className="text-3xl font-bold md:text-4xl">{faqHeading}</h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.q} className="group rounded-xl bg-muted">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold">{item.q}</span>
                      <Chevron />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-foreground px-6 py-20 text-background">
            <div className="mx-auto max-w-4xl space-y-6 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{ctaHeading}</h2>
              <p className="mx-auto max-w-xl text-lg text-background/80">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => go(ctaEmail)}
                  className="rounded-full bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaEmail}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="rounded-full border border-background/40 px-8 py-3 font-medium transition-colors hover:bg-background/10"
                >
                  {ctaPhone}
                </button>
              </div>
              <p className="pt-4 text-sm text-background/70">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground px-6 py-12 text-background/70">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className="grid size-8 place-items-center rounded-full bg-background/10 text-xs font-bold text-background"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                  <span className="font-semibold text-background">{brand}</span>
                </div>
                <p className="text-sm">{footerAbout}</p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
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
                <h4 className="mb-4 font-semibold text-background">Connect</h4>
                <ul className="space-y-2 text-sm">
                  {footerSocials.map((social) => (
                    <li key={social}>
                      <button
                        type="button"
                        onClick={() => go(social)}
                        className="transition-colors hover:text-background"
                      >
                        {social}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
              <p>
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex flex-wrap gap-6">
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
