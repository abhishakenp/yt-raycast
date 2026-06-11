import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FoodDeliveryKimiPage2 — SECOND, visually DISTINCT food-delivery LANDING page
 * variant (a sibling/alternative to FoodDeliveryKimiPage). A faithful Tailwind v4
 * port of a Kimi-generated "Feastly" design.
 *
 * Where the first variant is a cool, neutral, inverted-band aesthetic, THIS variant
 * is a warm, energetic, brand-tinted consumer page on a bright canvas: a soft
 * brand-gradient split hero (headline + delivery-address search + floating food
 * photo with "Avg delivery" and "4.9/5 reviews" cards), a press/awards logo strip,
 * a colorful 6-up features grid with tinted icon tiles, a discovery
 * restaurants gallery with cuisine-filter pills and 8 cards (star rating, discount
 * / BOGO / vegan badges, delivery time + distance + fee + Order button), a numbered
 * 1-2-3 "how it works" band ending in an embedded dark app-download promo card,
 * a brand-colored KPI stats strip, a 3-up star-rated testimonials grid with
 * avatars, a 6-item FAQ accordion (HTML <details>), a bold full-bleed brand-colored
 * final CTA with Download App / Order on Web buttons, and a dark multi-column
 * footer with social icons and a status line.
 *
 * Use as the ROOT/home page for food-delivery apps, restaurant aggregators, online
 * ordering / takeout platforms, ghost kitchens and meal-delivery startups when a
 * warm, punchy, conversion-focused alternative WITH an FAQ and restaurant discovery
 * is wanted (pick this over FoodDeliveryKimiPage for a brighter, more playful,
 * orange/brand-forward look). Every nav item / CTA / link / form-submit routes
 * through `useNavigate` (never a dead "#"); all imagery uses the alt-driven <Image>
 * component. Callers supply ONLY content data; rich defaults render the full page
 * with no props at all.
 */
export const FoodDeliveryKimiPage2 = defineCapsule({
  name: "FoodDeliveryKimiPage2",
  description:
    "Second, visually DISTINCT food-delivery / restaurant-marketplace LANDING page variant (alternative sibling to FoodDeliveryKimiPage): a warm, energetic, brand-tinted page on a bright canvas instead of the cool inverted look. Includes a soft brand-gradient split hero (big headline, delivery-address search input with a Find Food button, live-cities badge, food photo with floating 'avg delivery time' and '4.9/5 reviews' cards), a press/awards logo strip, a colorful SIX-card features grid with tinted icon tiles (lightning-fast delivery, safety/sealed bags, no hidden fees, live GPS tracking, save favorites, daily rewards points), a restaurant discovery gallery with cuisine-filter pills (All/Italian/Asian/Mexican/Burgers/Healthy/Desserts/Pizza) and eight restaurant cards (food photo, star rating + review count, discount/BOGO/vegan/Feastly+ badge, cuisine, delivery time + distance + delivery fee + Order button) plus a Load More button, a numbered 1-2-3 'how it works' band that ends in an embedded dark app-download promo card with App Store / Google Play buttons, a brand-colored KPI stats strip (partner restaurants, cities served, app rating, avg delivery time), a 3-up star-rated testimonials grid with avatars and order counts, a six-item FAQ accordion, a bold full-bleed brand-colored final CTA with Download App and Order on Web buttons, and a dark multi-column footer with company/customers/restaurants/legal links, social icons and an all-systems-operational status line. Choose this over FoodDeliveryKimiPage when a brighter, more playful, orange/brand-forward food-ordering home page WITH restaurant discovery filters and an FAQ is wanted. Supply content only — brand, nav, hero, logos, features, restaurants, steps, appPromo, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        liveBadge: z.string().optional(),
        headingLead: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        addressPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        perks: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        speedTitle: z.string().optional(),
        speedSubtitle: z.string().optional(),
        ratingValue: z.string().optional(),
        ratingCount: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        signIn: z.string().optional(),
        orderNow: z.string().optional(),
      })
      .optional(),
    /** Press / awards logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Restaurant discovery gallery. */
    restaurants: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        filters: z.array(z.string()).optional(),
        loadMore: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              category: z.string(),
              rating: z.string(),
              reviews: z.string(),
              time: z.string(),
              distance: z.string(),
              delivery: z.string(),
              badge: z.string().optional(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Numbered "how it works" band. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              stat: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Embedded app-download promo card. */
    appPromo: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        appStore: z.string().optional(),
        googlePlay: z.string().optional(),
      })
      .optional(),
    /** Brand-colored KPI stats strip. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
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
              meta: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-bleed brand final CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        note: z.string().optional(),
        madeWith: z.string().optional(),
        status: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Feastly"
    const nav = props.nav?.length
      ? props.nav
      : ["Restaurants", "How It Works", "Deals", "FAQ"]

    const liveBadge = props.hero?.liveBadge ?? "Live in 847 cities nationwide"
    const headingLead = props.hero?.headingLead ?? "Craving Something"
    const headingAccent = props.hero?.headingAccent ?? "Delicious?"
    const heroSub =
      props.hero?.subheading ??
      "Order from 12,000+ local favorites. From tacos to Thai, burgers to boba — delivered in 25 minutes on average."
    const addressPlaceholder =
      props.hero?.addressPlaceholder ?? "Enter delivery address..."
    const searchCta = props.hero?.searchCta ?? "Find Food"
    const heroPerks = props.hero?.perks?.length
      ? props.hero.perks
      : [
          "No delivery fees on first 3 orders",
          "Real-time GPS tracking",
          "24/7 customer support",
        ]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Gourmet burger with fries and fresh vegetables on wooden board"
    const speedTitle = props.hero?.speedTitle ?? "22 min"
    const speedSubtitle = props.hero?.speedSubtitle ?? "Avg. delivery"
    const ratingValue = props.hero?.ratingValue ?? "4.9/5"
    const ratingCount = props.hero?.ratingCount ?? "2.4M reviews"
    const heroAvatars = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "Customer avatar smiling woman with brown hair",
          "Customer avatar smiling man casual",
          "Customer avatar smiling woman blonde",
        ]
    const signIn = props.hero?.signIn ?? "Sign In"
    const orderNow = props.hero?.orderNow ?? "Order Now"

    const logosHeading =
      props.logos?.heading ?? "Trusted by 12,000+ restaurants & featured in"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "FoodWire",
          "EaterDaily",
          "TechCrunch",
          "ForbesEats",
          "Bloomberg",
          "WSJ Food",
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Choose Feastly"
    const featuresHeading =
      props.features?.heading ?? "The Best Way to Order Food"
    const featuresDesc =
      props.features?.description ??
      "We've perfected every step of the food delivery experience so you can focus on enjoying your meal."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Lightning Fast",
            description:
              "Average delivery time of 22 minutes. Our AI-powered dispatch routes orders to the closest available driver for maximum speed.",
          },
          {
            title: "Safety First",
            description:
              "Sealed bags, tamper-proof stickers, and contactless delivery options. Every order tracked from kitchen to your door.",
          },
          {
            title: "No Hidden Fees",
            description:
              "Transparent pricing with upfront cost breakdown. No surprise charges at checkout. Free delivery on orders over $25.",
          },
          {
            title: "Live GPS Tracking",
            description:
              "Watch your order in real-time on the map. Know exactly when your food will arrive with minute-by-minute updates.",
          },
          {
            title: "Save Favorites",
            description:
              "Reorder your go-to meals in one tap. Save restaurants, dishes, and customizations for lightning-fast ordering.",
          },
          {
            title: "Daily Rewards",
            description:
              "Earn Feastly Points on every order. Redeem for free delivery, discounts, and exclusive restaurant perks.",
          },
        ]

    const restaurantsEyebrow = props.restaurants?.eyebrow ?? "Popular Near You"
    const restaurantsHeading =
      props.restaurants?.heading ?? "Top-Rated Restaurants"
    const restaurantsDesc =
      props.restaurants?.description ??
      "Hand-picked local favorites with the highest ratings and fastest delivery times."
    const restaurantsViewAll = props.restaurants?.viewAll ?? "View All 12,000+"
    const restaurantFilters = props.restaurants?.filters?.length
      ? props.restaurants.filters
      : [
          "All",
          "Italian",
          "Asian",
          "Mexican",
          "Burgers",
          "Healthy",
          "Desserts",
          "Pizza",
        ]
    const restaurantsLoadMore =
      props.restaurants?.loadMore ?? "Load More Restaurants"
    const restaurantItems = props.restaurants?.items?.length
      ? props.restaurants.items
      : [
          {
            name: "Sakura Sushi",
            category: "Japanese • Sushi • $$",
            rating: "4.8",
            reviews: "(2.3k)",
            time: "18 min",
            distance: "0.8 mi",
            delivery: "$3.99 delivery",
            badge: "-20%",
            imageAlt:
              "Fresh salmon sushi rolls with soy sauce and wasabi on black plate",
          },
          {
            name: "Burger Barn",
            category: "American • Burgers • $$",
            rating: "4.9",
            reviews: "(4.1k)",
            time: "25 min",
            distance: "1.2 mi",
            delivery: "FREE delivery",
            imageAlt:
              "Juicy double cheeseburger with melted cheddar and crispy bacon",
          },
          {
            name: "The Prime Cut",
            category: "Steakhouse • American • $$$",
            rating: "4.7",
            reviews: "(1.8k)",
            time: "35 min",
            distance: "2.1 mi",
            delivery: "$5.99 delivery",
            badge: "Feastly+",
            imageAlt:
              "Grilled ribeye steak with rosemary and garlic butter",
          },
          {
            name: "Napoli Pizza",
            category: "Italian • Pizza • $$",
            rating: "4.6",
            reviews: "(3.2k)",
            time: "28 min",
            distance: "1.5 mi",
            delivery: "FREE delivery",
            badge: "BOGO",
            imageAlt: "Wood-fired pepperoni pizza with melted mozzarella",
          },
          {
            name: "Poke Paradise",
            category: "Hawaiian • Healthy • $$",
            rating: "4.9",
            reviews: "(892)",
            time: "15 min",
            distance: "0.6 mi",
            delivery: "$2.99 delivery",
            imageAlt: "Colorful fresh poke bowl with salmon and avocado",
          },
          {
            name: "Green Garden",
            category: "Vegan • Salads • $$",
            rating: "4.7",
            reviews: "(1.5k)",
            time: "20 min",
            distance: "0.9 mi",
            delivery: "FREE delivery",
            badge: "Vegan",
            imageAlt: "Fresh colorful salad bowl with quinoa and vegetables",
          },
          {
            name: "Pasta Palace",
            category: "Italian • Pasta • $$",
            rating: "4.8",
            reviews: "(2.7k)",
            time: "30 min",
            distance: "1.8 mi",
            delivery: "$4.99 delivery",
            imageAlt: "Creamy shrimp alfredo pasta in white bowl",
          },
          {
            name: "Sweet Tooth",
            category: "Desserts • Donuts • $",
            rating: "4.9",
            reviews: "(3.8k)",
            time: "12 min",
            distance: "0.4 mi",
            delivery: "$1.99 delivery",
            badge: "Open Late",
            imageAlt: "Assorted gourmet donuts with colorful glazes",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "From Craving to Crunching in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "We've streamlined food delivery so you spend less time waiting and more time eating."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Your Food",
            description:
              "Browse thousands of local restaurants, filter by cuisine, dietary preferences, or delivery time. Save your favorites for instant reordering.",
            stat: "12,000+ restaurants",
          },
          {
            title: "Track in Real-Time",
            description:
              "Watch your order from kitchen to door with live GPS tracking. Get minute-by-minute updates and know exactly when your food arrives.",
            stat: "Avg. 22 min delivery",
          },
          {
            title: "Enjoy & Earn Rewards",
            description:
              "Savor your meal and earn Feastly Points with every order. Redeem for free delivery, exclusive discounts, and VIP restaurant perks.",
            stat: "Earn 10 pts per $1",
          },
        ]

    const appPromoHeading =
      props.appPromo?.heading ?? "Download the Feastly App"
    const appPromoDesc =
      props.appPromo?.description ??
      "Get $15 off your first 3 orders when you order from the app."
    const appStore = props.appPromo?.appStore ?? "App Store"
    const googlePlay = props.appPromo?.googlePlay ?? "Google Play"

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12K+", label: "Partner Restaurants" },
          { value: "847", label: "Cities Served" },
          { value: "4.9★", label: "App Store Rating" },
          { value: "22m", label: "Avg. Delivery Time" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "What People Say"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by 5 Million+ Foodies"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it — hear from our community of hungry customers."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've tried every food delivery app out there, and Feastly is hands down the fastest. My sushi arrived in 18 minutes — still warm and perfectly presented. The GPS tracking is a game changer!",
            name: "Sarah Chen",
            meta: "San Francisco, CA • 142 orders",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair",
          },
          {
            quote:
              "As a restaurant owner, partnering with Feastly increased our delivery revenue by 340%. Their driver network is reliable and the customer support team actually answers the phone when we need help.",
            name: "Marcus Rodriguez",
            meta: "Owner, Burger Barn • Austin, TX",
            avatarAlt:
              "Professional headshot of a smiling man in his 40s",
          },
          {
            quote:
              "The Feastly Points rewards program is amazing! I've earned enough points for 6 free deliveries in just 3 months. Plus, the app is so easy to use my grandma orders her own lunch now.",
            name: "Jennifer Park",
            meta: "Chicago, IL • 89 orders",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about ordering with Feastly."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How much does delivery cost?",
            a: "Delivery fees vary by restaurant and distance, typically ranging from $0.99 to $5.99. Many restaurants offer FREE delivery on orders over $25. Plus, Feastly+ members get free delivery on all orders over $15 from participating restaurants. Your first 3 orders have no delivery fees!",
          },
          {
            q: "What is the average delivery time?",
            a: "Our average delivery time is 22 minutes from order confirmation to your door. You'll see an estimated delivery time before you order, and real-time tracking keeps you updated every step of the way. During peak hours (11am-2pm, 5pm-8pm), times may extend to 35-40 minutes.",
          },
          {
            q: "Can I schedule orders in advance?",
            a: 'Yes! You can schedule orders up to 7 days in advance. Perfect for planning lunch meetings, dinner parties, or just making sure your food arrives right when you want it. Select "Schedule" at checkout and choose your preferred delivery window.',
          },
          {
            q: "What if there's a problem with my order?",
            a: "Our 24/7 customer support team is here to help. Use the in-app chat for instant assistance, or call our hotline. If something is wrong with your order, we'll make it right with a refund, redelivery, or account credit — whatever you prefer. Your satisfaction is guaranteed.",
          },
          {
            q: "How do Feastly Points work?",
            a: "You earn 10 Feastly Points for every $1 spent. Points can be redeemed for free delivery (500 pts), discounts on orders (1,000 pts = $5 off), or exclusive restaurant perks. Points never expire for active users, and you can start redeeming once you hit 500 points.",
          },
          {
            q: "Is contactless delivery available?",
            a: 'Absolutely. All orders default to contactless delivery — your driver will leave your food at your door and send a photo confirmation. You can also add specific instructions like "Leave on porch table" or "Ring doorbell after drop-off." Your safety and convenience come first.',
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Hungry? Let's Fix That."
    const ctaDesc =
      props.cta?.description ??
      "Join 5 million+ food lovers. Get $15 off your first 3 orders when you download the Feastly app today."
    const ctaPrimary = props.cta?.primary ?? "Download App"
    const ctaSecondary = props.cta?.secondary ?? "Order on Web"
    const ctaNote =
      props.cta?.note ??
      "Available on iOS and Android. No credit card required to sign up."

    const footerDesc =
      props.footer?.description ??
      "The fastest, most reliable food delivery experience. Connecting hungry customers with local favorites since 2019."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerMadeWith =
      props.footer?.madeWith ?? "Made with ♥ in San Francisco"
    const footerStatus = props.footer?.status ?? "All systems operational"
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Contact"],
          },
          {
            heading: "For Customers",
            links: [
              "How It Works",
              "Restaurants",
              "Feastly+",
              "Gift Cards",
              "Support",
            ],
          },
          {
            heading: "For Restaurants",
            links: [
              "Partner With Us",
              "Restaurant Portal",
              "Marketing Tools",
              "Success Stories",
            ],
          },
          {
            heading: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Accessibility",
            ],
          },
        ]

    // Decorative inline icons (token-colored via currentColor).
    const FlameMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    )

    const MapPinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Six feature icons, each on a token-rotated tinted tile.
    const featureIcons: ReactNode[] = [
      <svg key="bolt" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="shield" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="dollar" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="pin" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg key="heart" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="gift" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>,
    ]
    // Token-rotated tinted icon tiles (no raw palette).
    const featureTints = [
      "bg-primary/10 text-primary",
      "bg-accent text-accent-foreground",
      "bg-secondary text-secondary-foreground",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
    ]

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
                className="flex items-center gap-2"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary text-primary-foreground">
                  <FlameMark className="size-6" />
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(signIn)}
                  className="hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {signIn}
                </button>
                <button
                  type="button"
                  onClick={() => go(orderNow)}
                  className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  {orderNow}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
                    <span className="flex size-2 rounded-full bg-chart-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {liveBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    {headingLead}{" "}
                    <span className="text-primary">{headingAccent}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-xl text-muted-foreground lg:mx-0">
                    {heroSub}
                  </p>

                  <form
                    className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(searchCta)
                    }}
                  >
                    <div className="relative max-w-md flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <MapPinIcon className="size-5 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        aria-label={addressPlaceholder}
                        placeholder={addressPlaceholder}
                        className="w-full rounded-xl border-2 border-input bg-card py-4 pl-11 pr-4 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      {searchCta}
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroPerks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <CheckIcon className="size-5 text-chart-2" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent blur-3xl" />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full bg-chart-2/15">
                        <ClockIcon className="size-6 text-chart-2" />
                      </span>
                      <div>
                        <p className="font-bold text-card-foreground">
                          {speedTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {speedSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {heroAvatars.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={40}
                            h={40}
                            loading="lazy"
                            className="size-8 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-card-foreground">
                          {ratingValue}
                        </p>
                        <p className="text-muted-foreground">{ratingCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center justify-center gap-2 text-xl font-bold text-foreground/70"
                  >
                    <StarIcon className="size-6 text-muted-foreground" />
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {featuresEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted/50 p-8 transition-all duration-300 hover:bg-card hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-6 flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                        featureTints[i % featureTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
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

          {/* Restaurant discovery */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {restaurantsEyebrow}
                  </span>
                  <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {restaurantsHeading}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    {restaurantsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(restaurantsViewAll)}
                  className="inline-flex items-center gap-2 text-lg font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {restaurantsViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>

              {/* Cuisine filters */}
              <div className="mb-10 flex flex-wrap gap-3">
                {restaurantFilters.map((filter, i) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => go(filter)}
                    className={cn(
                      "rounded-full px-5 py-2.5 font-medium transition-colors",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground/80 hover:border-primary/40",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Restaurant grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {restaurantItems.map((r) => (
                  <article
                    key={r.name}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="relative">
                      <Image
                        alt={r.imageAlt}
                        w={400}
                        h={300}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-card/95 px-2.5 py-1 backdrop-blur-sm">
                        <StarIcon className="size-4 text-chart-4" />
                        <span className="text-sm font-bold text-card-foreground">
                          {r.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {r.reviews}
                        </span>
                      </div>
                      {r.badge ? (
                        <span className="absolute right-3 top-3 rounded-lg bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                          {r.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                          {r.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {r.category}
                        </p>
                      </div>
                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-4" />
                          {r.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="size-4" />
                          {r.distance}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {r.delivery}
                        </span>
                        <button
                          type="button"
                          onClick={() => go(r.name)}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(restaurantsLoadMore)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-8 py-4 font-semibold text-foreground/80 transition-all hover:border-primary hover:text-primary"
                >
                  {restaurantsLoadMore}
                  <ChevronDown className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* How it works + app promo */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <article key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                      <span className="text-3xl font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 font-medium text-primary">
                      <span>{step.stat}</span>
                      <ArrowRight className="size-4" />
                    </div>
                  </article>
                ))}
              </div>

              {/* Embedded app-download promo card */}
              <div className="mt-16 flex flex-col items-center justify-between gap-8 rounded-3xl bg-foreground p-8 lg:flex-row lg:p-12">
                <div className="text-center lg:text-left">
                  <h3 className="mb-2 text-2xl font-bold text-background lg:text-3xl">
                    {appPromoHeading}
                  </h3>
                  <p className="text-background/70">{appPromoDesc}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(appStore)}
                    className="flex items-center gap-3 rounded-xl bg-background px-6 py-3 text-foreground transition-colors hover:bg-muted"
                  >
                    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-xs">Download on the</p>
                      <p className="font-bold">{appStore}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(googlePlay)}
                    className="flex items-center gap-3 rounded-xl bg-background px-6 py-3 text-foreground transition-colors hover:bg-muted"
                  >
                    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-xs">Get it on</p>
                      <p className="font-bold">{googlePlay}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-r from-primary to-primary/90 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/50 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={80}
                        h={80}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="transition-transform group-open:rotate-180">
                        <ChevronDown className="size-5 text-muted-foreground" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-primary py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-bold text-primary transition-colors hover:bg-muted"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary text-primary-foreground">
                    <FlameMark className="size-6" />
                  </span>
                  <span className="text-2xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-background/70">{footerDesc}</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="flex size-10 items-center justify-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Instagram"
                    onClick={() => go("Instagram")}
                    className="flex size-10 items-center justify-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Facebook"
                    onClick={() => go("Facebook")}
                    className="flex size-10 items-center justify-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-4 font-bold text-background">
                    {col.heading}
                  </h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
              <p className="text-sm text-background/60">
                © {new Date().getFullYear()} {brand} Inc. {footerNote}
              </p>
              <div className="flex items-center gap-6 text-sm text-background/60">
                <span>{footerMadeWith}</span>
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-chart-2" />
                  {footerStatus}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
