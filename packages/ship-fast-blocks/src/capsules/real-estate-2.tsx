import { useState } from "react"
import { z } from "zod/v4"
import { string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Button } from "#/components/ui/button.tsx"
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

const parsePriceAmount = (price: string) => {
  const value = Number.parseFloat(price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? value : 0
}

const formatUSD = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * RealEstateKimiPage2 — a complete, self-contained real-estate / property
 * brokerage LANDING page. This is the bold, photo-immersive ALTERNATIVE /
 * SECOND STYLE sibling to RealEstateKimiPage: where that block is a clean,
 * neutral, editorial light layout, THIS one is a punchy, image-forward
 * "Metro Nest" design — a full-bleed hero photo with a dark gradient overlay,
 * a glassy "properties sold" pill, an inline white search card floating over
 * the photo, a press-logos strip, property cards that carry a status badge +
 * favorite heart + price-over-image + a per-listing agent byline, a two-column
 * "why choose us" photo collage with a floating years-experience badge, a
 * full-width primary stats band, an agents roster with hover social overlays +
 * star ratings + a recruiting CTA, a six-up testimonials grid, a photo-backed
 * contact CTA with trust badges, an expandable FAQ accordion, and a rich
 * footer with quick links, property types, contact info and a newsletter
 * signup. Use whichever sibling best matches the desired mood; both render a
 * full page on defaults and route every action through useNavigate.
 */
export const RealEstateKimiPage2 = defineCapsule({
  name: "RealEstateKimiPage2",
  description:
    "Bold, photo-immersive real-estate / property-brokerage / realty LANDING page — the second-style ALTERNATIVE sibling to RealEstateKimiPage (which is the clean editorial neutral variant). This variant leads with a full-bleed hero photo under a dark gradient overlay carrying a glassy 'properties sold' status pill, a large headline, an inline white SEARCH card (location, property type, price range selects + search button) floating over the image, and a hero stat strip. It continues with a press / 'featured in' logos band, a FEATURED LISTINGS grid of rich property cards (For Sale / For Rent / New Listing / Luxury status badges, favorite heart, price over the photo, beds/baths/sqft specs, a per-card agent byline avatar and View Details), filter chips, a two-column WHY-CHOOSE-US photo collage with a floating years-experience badge and four feature blurbs, a full-width primary STATS band, an AGENTS roster with portrait cards, hover social overlays, role, sales stats and star ratings plus a recruiting / careers CTA card, a six-up star-rated TESTIMONIALS grid with client avatars, a photo-backed contact CTA band with schedule/call buttons and trust badges, an expandable FAQ accordion, and a footer with quick links, property types, contact details, social icons, a newsletter signup form and a legal bottom bar. Use as the ROOT/home page for real-estate agencies, property brokerages, realtors, luxury estates, rental platforms or relocation services when a vivid, photo-led property page is wanted. Supply content only — brand, nav, hero, search, listings, features, stats, agents, testimonials, contact, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / brokerage name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content (full-bleed photo + inline search). */
    hero: z
      .object({
        badge: z.string().optional(),
        headingBefore: z.string().optional(),
        highlight: z.string().optional(),
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        imageAlt: z.string().optional(),
        searchSubmit: z.string().optional(),
        locationLabel: z.string().optional(),
        locations: z.array(z.string()).optional(),
        typeLabel: z.string().optional(),
        types: z.array(z.string()).optional(),
        priceLabel: z.string().optional(),
        prices: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Press / featured-in logos strip. */
    press: z
      .object({
        heading: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured listings grid. */
    listings: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              location: z.string(),
              description: z.string(),
              status: z.string(),
              extraBadge: z.string().optional(),
              price: z.string(),
              priceSuffix: z.string().optional(),
              beds: z.string(),
              baths: z.string(),
              sqft: z.string(),
              agentName: z.string(),
              agentRole: z.string(),
              imageAlt: z.string(),
              agentAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why choose us" photo collage + feature blurbs. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
        cta: z.string().optional(),
        images: z.array(z.string()).optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-width primary stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Agents roster + recruiting CTA. */
    agents: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              stat: z.string(),
              reviews: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
        recruitHeading: z.string().optional(),
        recruitDescription: z.string().optional(),
        recruitCta: z.string().optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
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
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Photo-backed contact CTA band. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        moreHeading: z.string().optional(),
        moreDescription: z.string().optional(),
        moreCta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        quickLinksTitle: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        typesTitle: z.string().optional(),
        types: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        newsletterHeading: z.string().optional(),
        newsletterDescription: z.string().optional(),
        newsletterSubmit: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      favorites: table({
        title: string(),
        location: string(),
        price: string(),
        status: string(),
        imageAlt: string(),
      }),
      inquiries: table({
        email: string(),
        source: string(),
      }),
    },
    queries: {
      favorites: ({ db }) => db.favorites.orderBy("createdAt").all(),
      favoriteTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.title)),
    },
    mutations: {
      toggleFavorite: (
        { db },
        title: string,
        location: string,
        price: string,
        status: string,
        imageAlt: string,
      ) => {
        const existing = db.favorites.where("title", title).all()[0]

        if (existing) {
          db.favorites.delete(existing.id)
          return db.favorites.all()
        }

        db.favorites.insert({
          title,
          location,
          price,
          status,
          imageAlt,
        })

        return db.favorites.all()
      },
      removeFavorite: ({ db }, id: string) => {
        db.favorites.delete(id)
        return db.favorites.all()
      },
      clearFavorites: ({ db }) => {
        for (const favorite of db.favorites.all()) {
          db.favorites.delete(favorite.id)
        }
        return db.favorites.all()
      },
      submitInquiry: ({ db }, email: string, source: string) => {
        const normalizedEmail = email.trim()
        if (!normalizedEmail) return db.inquiries.all()

        db.inquiries.insert({
          email: normalizedEmail,
          source,
        })
        return db.inquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [savedOpen, setSavedOpen] = useState(false)
    const [newsletterEmail, setNewsletterEmail] = useState("")
    const brand = props.brand ?? "Metro Nest"
    const nav = props.nav?.length
      ? props.nav
      : ["Properties", "Agents", "About", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Over 2,500+ Properties Sold"
    const heroBefore = props.hero?.headingBefore ?? "Find Your"
    const heroHighlight = props.hero?.highlight ?? "Perfect"
    const heroAfter = props.hero?.headingAfter ?? "Place to Call Home"
    const heroSub =
      props.hero?.subheading ??
      "Discover exceptional properties in prime locations. From modern downtown condos to spacious suburban estates, we match you with homes that fit your lifestyle and budget."
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern luxury home exterior with pool at sunset"
    const heroSearchSubmit = props.hero?.searchSubmit ?? "Search"
    const heroLocationLabel = props.hero?.locationLabel ?? "Location"
    const heroLocations = props.hero?.locations?.length
      ? props.hero.locations
      : [
          "All Cities",
          "Manhattan, NY",
          "Brooklyn, NY",
          "San Francisco, CA",
          "Los Angeles, CA",
          "Miami, FL",
        ]
    const heroTypeLabel = props.hero?.typeLabel ?? "Property Type"
    const heroTypes = props.hero?.types?.length
      ? props.hero.types
      : ["All Types", "Apartment", "House", "Condo", "Townhouse", "Penthouse"]
    const heroPriceLabel = props.hero?.priceLabel ?? "Price Range"
    const heroPrices = props.hero?.prices?.length
      ? props.hero.prices
      : ["Any Price", "$200k - $500k", "$500k - $1M", "$1M - $2M", "$2M+"]
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "2,500+", label: "Properties Sold" },
          { value: "850+", label: "Happy Clients" },
          { value: "15+", label: "Years Experience" },
          { value: "98%", label: "Client Satisfaction" },
        ]

    const pressHeading =
      props.press?.heading ?? "Featured in leading publications"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["Google", "Airbnb", "Amazon", "Spotify", "Stripe"]

    const listingsEyebrow = props.listings?.eyebrow ?? "Featured Listings"
    const listingsHeading =
      props.listings?.heading ?? "Explore Our Premium Properties"
    const listingsDesc =
      props.listings?.description ??
      "Handpicked selection of exceptional homes, from luxury penthouses to charming family residences in sought-after neighborhoods."
    const listingsFilters = props.listings?.filters?.length
      ? props.listings.filters
      : ["All Properties", "For Sale", "For Rent", "New Developments"]
    const listingsViewAll = props.listings?.viewAll ?? "View All Properties"
    const listingItems = props.listings?.items?.length
      ? props.listings.items
      : [
          {
            title: "Oceanview Contemporary Villa",
            location: "Malibu, California",
            description:
              "Stunning architectural masterpiece featuring floor-to-ceiling windows, infinity pool, and direct beach access with smart home integration.",
            status: "For Sale",
            price: "$2,450,000",
            beds: "5 Beds",
            baths: "4 Baths",
            sqft: "4,200 sqft",
            agentName: "Sarah Chen",
            agentRole: "Luxury Specialist",
            imageAlt:
              "Luxury modern beachfront villa with infinity pool overlooking ocean",
            agentAlt:
              "Professional headshot of real estate agent Sarah Chen",
          },
          {
            title: "Manhattan Skyline Penthouse",
            location: "Tribeca, New York",
            description:
              "Exclusive penthouse with 360-degree city views, private terrace, concierge service, and premium finishes throughout.",
            status: "For Rent",
            extraBadge: "Featured",
            price: "$8,500",
            priceSuffix: "/mo",
            beds: "3 Beds",
            baths: "3 Baths",
            sqft: "2,800 sqft",
            agentName: "Marcus Johnson",
            agentRole: "Senior Agent",
            imageAlt:
              "Sleek modern penthouse apartment with city skyline views at night",
            agentAlt:
              "Professional headshot of real estate agent Marcus Johnson",
          },
          {
            title: "Craftsman Family Home",
            location: "Seattle, Washington",
            description:
              "Beautifully restored 1920s craftsman with original hardwood floors, updated kitchen, large backyard, and excellent school district.",
            status: "New Listing",
            price: "$875,000",
            beds: "4 Beds",
            baths: "2.5 Baths",
            sqft: "2,400 sqft",
            agentName: "Emily Rodriguez",
            agentRole: "Buyer Specialist",
            imageAlt:
              "Charming craftsman style family home with wraparound porch and garden",
            agentAlt:
              "Professional headshot of real estate agent Emily Rodriguez",
          },
          {
            title: "Industrial Arts District Loft",
            location: "Arts District, Los Angeles",
            description:
              "Converted warehouse loft featuring 14-foot ceilings, exposed brick walls, designer lighting, and walkable to galleries and restaurants.",
            status: "For Sale",
            price: "$1,250,000",
            beds: "2 Beds",
            baths: "2 Baths",
            sqft: "1,800 sqft",
            agentName: "David Kim",
            agentRole: "Market Expert",
            imageAlt:
              "Minimalist loft apartment with exposed brick walls and industrial lighting",
            agentAlt: "Professional headshot of real estate agent David Kim",
          },
          {
            title: "Mediterranean Estate",
            location: "Coral Gables, Florida",
            description:
              "Exquisite Mediterranean-inspired estate on 2 acres with guest house, wine cellar, home theater, resort-style pool, and 4-car garage.",
            status: "For Sale",
            extraBadge: "Luxury",
            price: "$4,750,000",
            beds: "6 Beds",
            baths: "7 Baths",
            sqft: "8,500 sqft",
            agentName: "Sarah Chen",
            agentRole: "Luxury Specialist",
            imageAlt:
              "Elegant Mediterranean style mansion with terracotta roof and landscaped gardens",
            agentAlt:
              "Professional headshot of real estate agent Sarah Chen",
          },
          {
            title: "Modern Urban Townhouse",
            location: "South End, Boston",
            description:
              "Stunning contemporary townhouse with rooftop terrace, private elevator, chef's kitchen, and steps from public transit and dining.",
            status: "For Rent",
            price: "$4,200",
            priceSuffix: "/mo",
            beds: "3 Beds",
            baths: "3.5 Baths",
            sqft: "2,200 sqft",
            agentName: "James Patterson",
            agentRole: "Rental Specialist",
            imageAlt:
              "Modern glass and steel urban townhouse with rooftop garden",
            agentAlt:
              "Professional headshot of real estate agent James Patterson",
          },
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Choose Us"
    const featuresHeading =
      props.features?.heading ?? "We Make Finding Your Dream Home Simple"
    const featuresDesc =
      props.features?.description ??
      "With over 15 years of experience and thousands of successful transactions, Metro Nest has built a reputation for excellence. Our team combines local market expertise with cutting-edge technology to deliver an unmatched real estate experience."
    const featuresBadgeValue = props.features?.badgeValue ?? "15+"
    const featuresBadgeLabel = props.features?.badgeLabel ?? "Years Experience"
    const featuresCta = props.features?.cta ?? "Start Your Search"
    const featuresImages = props.features?.images?.length
      ? props.features.images
      : [
          "Happy couple receiving house keys from real estate agent at closing",
          "Professional real estate agent showing modern home interior to clients",
          "Aerial view of suburban neighborhood with houses and green spaces",
          "Luxury home exterior with manicured landscaping and driveway",
        ]
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Property Search",
            description:
              "Advanced filters and AI-powered recommendations to find your perfect match faster.",
          },
          {
            title: "Expert Negotiation",
            description:
              "Skilled negotiators who secure the best deals and protect your interests.",
          },
          {
            title: "24/7 Support",
            description:
              "Round-the-clock assistance throughout your buying or selling journey.",
          },
          {
            title: "Secure Transactions",
            description:
              "Verified listings and secure processes to give you peace of mind.",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,500+", label: "Properties Sold" },
          { value: "$2.8B", label: "Sales Volume" },
          { value: "850+", label: "Happy Clients" },
          { value: "48", label: "Expert Agents" },
        ]

    const agentsEyebrow = props.agents?.eyebrow ?? "Our Team"
    const agentsHeading = props.agents?.heading ?? "Meet Our Expert Agents"
    const agentsDesc =
      props.agents?.description ??
      "Our team of certified professionals brings decades of combined experience and deep local market knowledge to help you achieve your real estate goals."
    const agentItems = props.agents?.items?.length
      ? props.agents.items
      : [
          {
            name: "Sarah Chen",
            role: "Luxury Property Specialist",
            stat: "12 years experience • $450M+ in sales",
            reviews: "(128 reviews)",
            imageAlt:
              "Professional headshot of luxury real estate specialist Sarah Chen in navy blazer",
          },
          {
            name: "Marcus Johnson",
            role: "Senior Real Estate Agent",
            stat: "15 years experience • $620M+ in sales",
            reviews: "(156 reviews)",
            imageAlt:
              "Professional headshot of senior real estate agent Marcus Johnson in charcoal suit",
          },
          {
            name: "Emily Rodriguez",
            role: "First-Time Buyer Specialist",
            stat: "8 years experience • 350+ families helped",
            reviews: "(94 reviews)",
            imageAlt:
              "Professional headshot of buyer specialist Emily Rodriguez in professional attire",
          },
          {
            name: "David Kim",
            role: "Commercial & Investment",
            stat: "10 years experience • $380M+ in sales",
            reviews: "(87 reviews)",
            imageAlt:
              "Professional headshot of market expert David Kim in business casual attire",
          },
        ]
    const recruitHeading =
      props.agents?.recruitHeading ?? "Looking for a Career in Real Estate?"
    const recruitDesc =
      props.agents?.recruitDescription ??
      "Join our team of industry-leading professionals. We provide comprehensive training, marketing support, and a collaborative environment to help you succeed."
    const recruitCta = props.agents?.recruitCta ?? "View Open Positions"

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what homeowners, buyers, and investors have to say about their experience with Metro Nest."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Sarah Chen made our dream of owning a beachfront property a reality. Her knowledge of the Malibu market is unmatched, and she negotiated a price $200k below asking. Incredible service!",
            name: "Jennifer Walsh",
            role: "Purchased in Malibu, CA",
            avatarAlt:
              "Professional headshot of satisfied client Jennifer Walsh",
          },
          {
            quote:
              "As first-time buyers, we were nervous about the process. Emily walked us through every step, found us the perfect starter home, and we closed in just 21 days. Couldn't be happier!",
            name: "Michael Torres",
            role: "First-time Buyer, Seattle",
            avatarAlt:
              "Professional headshot of satisfied client Michael Torres",
          },
          {
            quote:
              "Marcus helped us sell our Tribeca penthouse for full price in just 8 days. His marketing strategy and network of buyers is extraordinary. Best real estate experience we've ever had.",
            name: "Amanda Chen",
            role: "Sold in Tribeca, NY",
            avatarAlt:
              "Professional headshot of satisfied client Amanda Chen",
          },
          {
            quote:
              "David identified an incredible investment opportunity in the Arts District. The property has already appreciated 35% in 18 months. His market insights are truly valuable.",
            name: "Robert Kim",
            role: "Real Estate Investor",
            avatarAlt: "Professional headshot of satisfied client Robert Kim",
          },
          {
            quote:
              "The Metro Nest team's responsiveness is amazing. Whether it's 9 AM or 9 PM, they answer questions and keep you updated. Made our cross-country move so much smoother.",
            name: "Lisa Anderson",
            role: "Relocated to Boston",
            avatarAlt:
              "Professional headshot of satisfied client Lisa Anderson",
          },
          {
            quote:
              "We had a complex situation with contingencies and a tight timeline. The team coordinated everything perfectly. We got our dream home and sold our old one seamlessly.",
            name: "James Mitchell",
            role: "Bought & Sold in Miami",
            avatarAlt:
              "Professional headshot of satisfied client James Mitchell",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready to Find Your Dream Home?"
    const contactDesc =
      props.contact?.description ??
      "Whether you're buying, selling, or investing, our team is here to guide you every step of the way. Let's start your real estate journey today."
    const contactPrimary =
      props.contact?.primaryCta ?? "Schedule a Consultation"
    const contactSecondary =
      props.contact?.secondaryCta ?? "Call (555) 123-4567"
    const contactImageAlt =
      props.contact?.imageAlt ??
      "Happy couple holding keys to their new home with real estate agent"
    const contactBadges = props.contact?.badges?.length
      ? props.contact.badges
      : ["Free Consultation", "No Obligation", "Expert Guidance"]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about buying, selling, or renting with Metro Nest."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How do I get started with buying a home?",
            answer:
              "Start by scheduling a free consultation with one of our buyer specialists. We'll discuss your budget, preferences, and timeline. Then we'll set up a personalized property search and guide you through viewings, negotiations, and closing. We also recommend getting pre-approved for a mortgage to strengthen your offers.",
          },
          {
            question: "What fees are involved when selling my property?",
            answer:
              "Our commission is typically 5-6% of the sale price, which is split between the buyer's and seller's agents. This covers marketing, professional photography, listing on MLS, open houses, negotiation, and transaction management. There are no upfront fees—you only pay when your home sells.",
          },
          {
            question:
              "How long does the home buying process typically take?",
            answer:
              "The timeline varies, but most buyers find a home within 2-3 months of starting their search. Once an offer is accepted, closing typically takes 30-45 days. Cash purchases can close in as little as 2 weeks. We'll work with your timeline and keep you informed at every step.",
          },
          {
            question: "Do you help with rental properties?",
            answer:
              "Yes! We offer comprehensive rental services for both tenants and landlords. For tenants, we help find qualified properties, schedule viewings, and negotiate lease terms. For landlords, we handle tenant screening, lease agreements, and property management referrals.",
          },
          {
            question: "What areas do you serve?",
            answer:
              "We primarily serve major metropolitan areas including New York City, Los Angeles, San Francisco, Miami, Boston, and Seattle. Through our partner network, we can also assist with relocations and investments nationwide. Contact us for specific area coverage.",
          },
          {
            question: "Can I get a free property valuation?",
            answer:
              "Absolutely! We offer complimentary comparative market analyses (CMAs) that provide an accurate estimate of your property's current market value. This includes recent sales data, market trends, and recommendations for maximizing your sale price. No obligation required.",
          },
        ]
    const faqMoreHeading = props.faq?.moreHeading ?? "Still have questions?"
    const faqMoreDesc =
      props.faq?.moreDescription ??
      "Can't find the answer you're looking for? Our team is here to help."
    const faqMoreCta = props.faq?.moreCta ?? "Contact our support team"

    const footerAbout =
      props.footer?.about ??
      "Your trusted partner in real estate. We help you find, buy, sell, and invest in properties that match your dreams and goals."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "Twitter", "LinkedIn"]
    const footerQuickTitle = props.footer?.quickLinksTitle ?? "Quick Links"
    const footerQuickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["Properties", "Our Agents", "About Us", "Testimonials", "Blog", "FAQ"]
    const footerTypesTitle = props.footer?.typesTitle ?? "Property Types"
    const footerTypes = props.footer?.types?.length
      ? props.footer.types
      : [
          "Luxury Homes",
          "Apartments",
          "Condos",
          "Townhouses",
          "Commercial",
          "New Developments",
        ]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact Us"
    const footerAddress =
      props.footer?.address ?? "350 Fifth Avenue, Suite 4500, New York, NY 10118"
    const footerPhone = props.footer?.phone ?? "(555) 123-4567"
    const footerEmail = props.footer?.email ?? "hello@metronest.com"
    const footerHours = props.footer?.hours ?? "Mon - Sat: 9AM - 7PM"
    const footerNewsHeading =
      props.footer?.newsletterHeading ?? "Subscribe to Our Newsletter"
    const footerNewsDesc =
      props.footer?.newsletterDescription ??
      "Get the latest property listings, market insights, and exclusive offers delivered to your inbox."
    const footerNewsSubmit = props.footer?.newsletterSubmit ?? "Subscribe"
    const footerCopyright =
      props.footer?.copyright ??
      "© 2026 Metro Nest Real Estate. All rights reserved."
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const storedFavorites = lakebed.useQuery("favorites")
    const favoriteTitles = lakebed.useQuery("favoriteTitles")
    const toggleFavorite = lakebed.useMutation("toggleFavorite")
    const removeFavorite = lakebed.useMutation("removeFavorite")
    const clearFavorites = lakebed.useMutation("clearFavorites")
    const submitInquiry = lakebed.useMutation("submitInquiry")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const savedProperties = storedFavorites ?? []
    const favoriteTitleSet = favoriteTitles ?? new Set<string>()
    const savedCount = savedProperties.length
    const savedTotal = savedProperties.reduce(
      (total, item) => total + parsePriceAmount(item.price),
      0,
    )

    // --- Icons (decorative inline SVG, currentColor) ---
    const BuildingMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-4m-6 0H3m2 0h4m0 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4m-8-8h.01M12 9h.01M16 9h.01M8 13h.01M16 13h.01"
        />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
    )

    const PinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
      </svg>
    )

    const HeartIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
      </svg>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const BedIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    )

    const BathIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    )

    const AreaIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    )

    const FacebookIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )

    const InstagramIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )

    const SocialIcon = ({
      name,
      className,
    }: {
      name: string
      className?: string
    }) => {
      const key = name.toLowerCase()
      if (key.includes("face")) return <FacebookIcon className={className} />
      if (key.includes("insta")) return <InstagramIcon className={className} />
      if (key.includes("twit")) return <TwitterIcon className={className} />
      return <LinkedInIcon className={className} />
    }

    const statusClass = (status: string) => {
      const key = status.toLowerCase()
      if (key.includes("new"))
        return "bg-secondary text-secondary-foreground"
      return "bg-primary text-primary-foreground"
    }

    const heroSelectCls =
      "w-full cursor-pointer appearance-none bg-transparent font-medium text-foreground focus:outline-none"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BuildingMark className="size-5" />
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="hidden items-center gap-4 md:flex">
                <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open saved properties"
                      className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                    >
                      <HeartIcon className="size-5" />
                      {savedCount > 0 ? (
                        <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                          {savedCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader className="border-b border-border pb-4">
                      <SheetTitle>Saved Listings</SheetTitle>
                      <SheetDescription>
                        {savedCount
                          ? `${savedCount} saved listing${
                              savedCount === 1 ? "" : "s"
                            } in your review list.`
                          : "You have no saved listings yet."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-1 py-5">
                      {savedProperties.length ? (
                        <div className="space-y-4">
                          {savedProperties.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.location}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                  {item.price}
                                </p>
                                <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                  {item.status}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => void removeFavorite(item.id)}
                                className="text-xs font-medium text-muted-foreground hover:text-destructive"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">
                              Saved Value
                            </p>
                            <p>{formatUSD(savedTotal)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                          Click the heart icon on any listing to save it for
                          later.
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border pt-4">
                      <div className="grid w-full grid-cols-1 gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setSavedOpen(false)
                            go(contactPrimary)
                          }}
                          disabled={!savedProperties.length}
                          className="w-full"
                        >
                          {contactPrimary}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void clearFavorites()}
                            disabled={!savedProperties.length}
                            className="w-full"
                          >
                            Clear
                          </Button>
                          <SheetClose asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full"
                            >
                              Continue browsing
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(footerPhone)}
                  className="flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <PhoneIcon className="size-4" />
                  <span>{footerPhone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                    aria-label="Sign out"
                  >
                    {authLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                    aria-label="Sign in with Google"
                  >
                    {authLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary md:hidden"
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
                    setSavedOpen(true)
                  }}
                  className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                >
                  Saved Listings ({savedCount})
                </button>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignOut()
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-left font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {authLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignIn()
                    }}
                    disabled={auth.isLoading}
                    className="rounded-lg border border-border px-3 py-2 text-left font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                  >
                    {authLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-[90vh] items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-2 backdrop-blur-sm">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-background/90">
                    {heroBadge}
                  </span>
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-background sm:text-5xl lg:text-7xl">
                  {heroBefore} <span className="text-primary">{heroHighlight}</span>{" "}
                  {heroAfter}
                </h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-background/80 sm:text-xl">
                  {heroSub}
                </p>

                {/* Search card */}
                <div className="max-w-4xl rounded-2xl bg-card p-2 shadow-2xl">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-r">
                      <label
                        htmlFor="re2-location"
                        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {heroLocationLabel}
                      </label>
                      <select id="re2-location" className={heroSelectCls}>
                        {heroLocations.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border-b border-border px-4 py-3 sm:border-b-0 lg:border-r">
                      <label
                        htmlFor="re2-type"
                        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {heroTypeLabel}
                      </label>
                      <select id="re2-type" className={heroSelectCls}>
                        {heroTypes.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-r">
                      <label
                        htmlFor="re2-price"
                        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {heroPriceLabel}
                      </label>
                      <select id="re2-price" className={heroSelectCls}>
                        {heroPrices.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(heroSearchSubmit)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <SearchIcon className="size-5" />
                      <span>{heroSearchSubmit}</span>
                    </button>
                  </div>
                </div>

                {/* Hero stats */}
                <div className="mt-12 flex flex-wrap gap-8 sm:gap-12">
                  {heroStats.map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-bold text-background sm:text-4xl">
                        {s.value}
                      </div>
                      <div className="text-sm text-background/70">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {pressHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 sm:gap-16">
                {pressLogos.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center gap-2 text-xl font-bold text-foreground"
                  >
                    <BuildingMark className="size-6" />
                    <span>{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Listings */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {listingsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {listingsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{listingsDesc}</p>
              </div>

              <div className="mb-12 flex flex-wrap justify-center gap-3">
                {listingsFilters.map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => go(f)}
                    className={cn(
                      "rounded-full px-6 py-3 font-medium transition-all",
                      i === 0
                        ? "bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {listingItems.map((p) => {
                  const isSaved = favoriteTitleSet.has(p.title)
                  return (
                    <article
                      key={p.title}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        alt={p.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4 flex gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-semibold",
                            statusClass(p.status),
                          )}
                        >
                          {p.status}
                        </span>
                        {p.extraBadge ? (
                          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                            {p.extraBadge}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label={isSaved ? `Unsave ${p.title}` : `Save ${p.title}`}
                        onClick={() => {
                          void toggleFavorite(
                            p.title,
                            p.location,
                            p.price,
                            p.status,
                            p.imageAlt,
                          )
                        }}
                        className={cn(
                          "absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-colors",
                          isSaved
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary",
                        )}
                      >
                        <HeartIcon className="size-5" />
                      </button>
                      <div className="absolute inset-x-4 bottom-4">
                        <div className="text-2xl font-bold text-background drop-shadow-lg">
                          {p.price}
                          {p.priceSuffix ? (
                            <span className="text-lg font-normal">
                              {p.priceSuffix}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold text-card-foreground">
                        {p.title}
                      </h3>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <PinIcon className="size-4 text-primary" />
                        {p.location}
                      </p>
                      <p className="mb-4 mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                      <div className="flex items-center gap-6 border-t border-border py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BedIcon className="size-4 text-primary" />
                          <span className="font-medium">{p.beds}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BathIcon className="size-4 text-primary" />
                          <span className="font-medium">{p.baths}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <AreaIcon className="size-4 text-primary" />
                          <span className="font-medium">{p.sqft}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-3">
                          <span className="size-10 overflow-hidden rounded-full bg-muted">
                            <Image
                              alt={p.agentAlt}
                              w={100}
                              h={100}
                              loading="lazy"
                              className="size-full object-cover"
                            />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">
                              {p.agentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.agentRole}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => go(p.title)}
                          className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          View Details
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                    </article>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(listingsViewAll)}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {listingsViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <Image
                          alt={featuresImages[0]}
                          w={600}
                          h={500}
                          loading="lazy"
                          className="h-64 w-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <Image
                          alt={featuresImages[1]}
                          w={600}
                          h={400}
                          loading="lazy"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <Image
                          alt={featuresImages[2]}
                          w={600}
                          h={400}
                          loading="lazy"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl shadow-lg">
                        <Image
                          alt={featuresImages[3]}
                          w={600}
                          h={500}
                          loading="lazy"
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 rounded-2xl bg-primary p-6 text-primary-foreground shadow-2xl shadow-primary/30">
                    <div className="text-4xl font-bold">{featuresBadgeValue}</div>
                    <div className="text-sm text-primary-foreground/80">
                      {featuresBadgeLabel}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                    {featuresEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {featuresHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {featuresDesc}
                  </p>
                  <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    {featureItems.map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <CheckCircle className="size-6" />
                        </span>
                        <div>
                          <h3 className="mb-1 font-bold text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(featuresCta)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                  >
                    {featuresCta}
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Agents */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {agentsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {agentsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{agentsDesc}</p>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {agentItems.map((agent) => (
                  <article key={agent.name} className="group text-center">
                    <div className="relative mb-6 overflow-hidden rounded-2xl">
                      <Image
                        alt={agent.imageAlt}
                        w={400}
                        h={533}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-4 flex translate-y-4 justify-center gap-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={`${agent.name} on LinkedIn`}
                          onClick={() => go(`${agent.name} on LinkedIn`)}
                          className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-primary"
                        >
                          <LinkedInIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${agent.name} on Twitter`}
                          onClick={() => go(`${agent.name} on Twitter`)}
                          className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-primary"
                        >
                          <TwitterIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Email ${agent.name}`}
                          onClick={() => go(`Email ${agent.name}`)}
                          className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-primary"
                        >
                          <MailIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-foreground">
                      {agent.name}
                    </h3>
                    <p className="mb-2 text-sm font-semibold text-primary">
                      {agent.role}
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {agent.stat}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-4" />
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">
                        {agent.reviews}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-16 text-center">
                <div className="rounded-3xl bg-foreground p-8 text-background sm:p-12 lg:p-16">
                  <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
                    {recruitHeading}
                  </h3>
                  <p className="mx-auto mb-8 max-w-2xl text-background/70">
                    {recruitDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(recruitCta)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {recruitCta}
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="size-12 overflow-hidden rounded-full bg-muted">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </span>
                      <div>
                        <h4 className="font-bold text-card-foreground">
                          {t.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="absolute inset-0 z-0">
              <Image
                alt={contactImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/90" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
                {contactDesc}
              </p>
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(contactPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-bold text-primary shadow-xl transition-colors hover:bg-muted"
                >
                  <CheckCircle className="size-5" />
                  {contactPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-background/30 bg-primary-foreground/10 px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <PhoneIcon className="size-5" />
                  {contactSecondary}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/80">
                {contactBadges.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-primary-foreground" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl bg-muted transition-all open:bg-card open:shadow-lg"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 text-lg font-bold text-foreground">
                        {item.question}
                      </h3>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors group-open:bg-primary group-open:text-primary-foreground">
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
                            d="M12 4v16m8-8H4"
                            className="group-open:hidden"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M20 12H4"
                            className="hidden group-open:block"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-12 rounded-2xl bg-muted p-8 text-center">
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {faqMoreHeading}
                </h3>
                <p className="mb-4 text-muted-foreground">{faqMoreDesc}</p>
                <button
                  type="button"
                  onClick={() => go(faqMoreCta)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <MailIcon className="size-5" />
                  {faqMoreCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground pb-8 pt-20 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <BuildingMark className="size-5" />
                  </span>
                  <span className="text-2xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 leading-relaxed text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-3">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-lg bg-background/10 transition-colors hover:bg-primary"
                    >
                      <SocialIcon name={social} className="size-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-6 text-lg font-bold">{footerQuickTitle}</h4>
                <ul className="space-y-3">
                  {footerQuickLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-6 text-lg font-bold">{footerTypesTitle}</h4>
                <ul className="space-y-3">
                  {footerTypes.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-6 text-lg font-bold">{footerContactTitle}</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <PinIcon className="mt-1 size-5 shrink-0 text-primary" />
                    <span className="text-background/60">{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-background/60 transition-colors hover:text-primary"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <MailIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-background/60 transition-colors hover:text-primary"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <ClockIcon className="size-5 shrink-0 text-primary" />
                    <span className="text-background/60">{footerHours}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mb-12 border-t border-background/10 pt-12">
              <div className="rounded-2xl bg-background/10 p-8 sm:p-12">
                <div className="max-w-2xl">
                  <h3 className="mb-2 text-2xl font-bold">
                    {footerNewsHeading}
                  </h3>
                  <p className="mb-6 text-background/60">{footerNewsDesc}</p>
                  <form
                    className="flex flex-col gap-4 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const email = newsletterEmail.trim()
                      if (email) {
                        void submitInquiry(email, "newsletter")
                        setNewsletterEmail("")
                      }
                      go(footerNewsSubmit)
                    }}
                  >
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      aria-label="Email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 rounded-xl border border-input bg-background/10 px-6 py-4 text-background placeholder-background/50 transition-colors focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <MailIcon className="size-5" />
                      {footerNewsSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-primary"
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
