import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BeautyStoreKimiPage2 — the SECOND, visually distinct beauty / skincare /
 * cosmetics e-commerce STOREFRONT variant (an alternative sibling to
 * BeautyStoreKimiPage), so repeat "beauty store" prompts yield a different look.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "LUMIÈRE" design: a bold,
 * playful, blush-rose e-commerce aesthetic — NOT the soft editorial serif look
 * of the first variant. Light blush canvas, heavy black/extrabold SANS headings,
 * fully ROUNDED pill buttons and badges, and saturated rose primary accents. It
 * pairs a split hero (spring-collection pill, "Beauty That Glows" headline with a
 * rose highlight word, dual rounded CTAs, trust chips, product photo with a
 * floating star-rating card) with a press logo strip (VOGUE/ELLE/ALLURE), a
 * 4-up shoppable bestsellers product grid (brand, title, stars, review count,
 * price, corner status badges, hover add-to-cart), a 3-up "Beauty, Simplified"
 * benefits grid with rounded icon tiles, a Shop-by-Category overlay-image
 * gallery (4 tall tiles with gradient captions + product counts), a 3-up
 * testimonials band, a DARK stats counter band, a numbered 4-step "Your Beauty
 * Journey" how-it-works row, a 6-item FAQ accordion, a saturated rose gradient
 * newsletter CTA with email capture, and a dark 5-column footer with social
 * icons + link columns.
 *
 * The block owns ALL layout, spacing, accents and type hierarchy. Every nav
 * item / CTA / product / category / link / form-submit routes through
 * `useNavigate` (never a dead "#"), navbar labels match the `nav` array so
 * PageSwitch can swap pages, and all imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content; rich defaults make
 * it render great with no props at all.
 */
export const BeautyStoreKimiPage2 = defineComponent({
  name: "BeautyStoreKimiPage2",
  description:
    "Second, alternative beauty / skincare / cosmetics e-commerce STOREFRONT landing page — a visually DISTINCT sibling to BeautyStoreKimiPage with a bolder, playful, blush-rose look (light pink canvas, heavy black/extrabold sans-serif headings, fully rounded pill buttons and corner status badges, saturated rose primary accents) instead of the soft editorial serif style. Includes a split hero ('New Spring Collection' pill, 'Beauty That Glows' headline with a rose highlight word, dual rounded shop CTAs, Free Returns / Cruelty-Free / Clean Beauty trust chips, hero product photo with a floating 4.9/5 star-rating card), a press/trusted-by logo strip (VOGUE, ELLE, ALLURE, SEPHORA), a 4-up shoppable bestsellers PRODUCT GRID (brand, product title, star rating, review count, price, #1 Bestseller / Sold 50K+ / Vegan / Award Winner corner badges and hover add-to-cart), a 3-up 'Beauty, Simplified' benefits grid (clean beauty promise, same-day delivery, cruelty-free) with rounded icon tiles, a Shop-by-Category overlay-image gallery (Skincare / Makeup / Haircare / Fragrance tiles with gradient captions and product counts), a 3-up customer testimonials band with avatars and stars, a DARK stats counter band (curated products, happy customers, average rating, brand partners), a numbered 4-step 'Your Beauty Journey' how-it-works row, a 6-item FAQ accordion, a saturated rose gradient newsletter CTA with email capture for a first-order discount, and a dark 5-column footer with social icons and link columns. Use as the ROOT/home page for a beauty store, skincare shop, cosmetics or makeup brand, clean/cruelty-free beauty retailer, fragrance or haircare e-commerce site, or any DTC personal-care storefront that wants a bright, energetic, conversion-focused storefront with product showcase plus social proof. Pick this variant when you want a punchier, more retail/promotional beauty storefront than the muted editorial first style. Supply content only — brand, nav, hero, logos, products, benefits, categories, testimonials, stats, steps, faq, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading text rendered before the highlighted word. */
        headingTop: z.string().optional(),
        /** Word rendered in the rose accent color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Small trust chips under the CTAs. */
        chips: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        ratingValue: z.string().optional(),
        ratingNote: z.string().optional(),
      })
      .optional(),
    /** Press / trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** Shoppable bestsellers product grid. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              brand: z.string(),
              title: z.string(),
              price: z.string(),
              reviews: z.string(),
              /** Optional corner badge text (e.g. #1 Bestseller / Vegan). */
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Beauty, Simplified" benefits grid. */
    benefits: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Shop-by-category overlay-image gallery. */
    categories: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** Customer testimonials band. */
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
    /** Dark stats counter band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered "Your Beauty Journey" how-it-works steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
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
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Rose gradient newsletter CTA. */
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
        description: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "LUMIÈRE"
    const nav = props.nav?.length
      ? props.nav
      : ["Bestsellers", "Skincare", "Makeup", "Brands", "Our Story"]

    const heroEyebrow = props.hero?.eyebrow ?? "New Spring Collection"
    const heroHeadingTop = props.hero?.headingTop ?? "Beauty That"
    const heroHighlight = props.hero?.highlight ?? "Glows"
    const heroSub =
      props.hero?.subheading ??
      "Discover award-winning skincare and makeup curated by experts. Free shipping on orders over $50. Join 2M+ beauty lovers worldwide."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Bestsellers"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Brands"
    const heroChips = props.hero?.chips?.length
      ? props.hero.chips
      : ["Free Returns", "Cruelty-Free", "Clean Beauty"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "collection of luxury skincare and makeup products with rose gold accents on marble surface"
    const heroRatingValue = props.hero?.ratingValue ?? "4.9/5 Rating"
    const heroRatingNote = props.hero?.ratingNote ?? "From 48,000+ reviews"

    const logosHeading = props.logos?.heading ?? "Featured in & trusted by"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ["VOGUE", "ELLE", "ALLURE", "SEPHORA", "BYRDIE", "GLAMOUR"]

    const productsEyebrow = props.products?.eyebrow ?? "Most Loved"
    const productsHeading = props.products?.heading ?? "Bestsellers"
    const productsDesc =
      props.products?.description ??
      "Our customers' favorite products, handpicked from over 5,000+ beauty essentials."
    const productsViewAll = props.products?.viewAll ?? "View All Bestsellers"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            brand: "Glow Recipe",
            title: "Watermelon Glow Niacinamide Dew Drops",
            price: "$35.00",
            reviews: "(12,847)",
            badge: "#1 Bestseller",
          },
          {
            brand: "Rare Beauty",
            title: "Soft Pinch Liquid Blush - Happy",
            price: "$23.00",
            reviews: "(28,392)",
            badge: "Sold 50K+",
          },
          {
            brand: "The Ordinary",
            title: "Niacinamide 10% + Zinc 1%",
            price: "$6.00",
            reviews: "(45,612)",
            badge: "Vegan",
          },
          {
            brand: "Charlotte Tilbury",
            title: "Matte Revolution Lipstick - Pillow Talk",
            price: "$34.00",
            reviews: "(8,934)",
            badge: "Award Winner",
          },
        ]

    const benefitsEyebrow = props.benefits?.eyebrow ?? "Why LUMIÈRE"
    const benefitsHeading = props.benefits?.heading ?? "Beauty, Simplified"
    const benefitsDesc =
      props.benefits?.description ??
      "We curate only the best, so you can shop with confidence. Every product is vetted by our expert team."
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: "Clean Beauty Promise",
            description:
              "Every product is free from parabens, sulfates, and phthalates. We verify ingredients so you don't have to.",
          },
          {
            title: "Same-Day Delivery",
            description:
              "Order by 2 PM for same-day delivery in major cities. Free standard shipping on all orders over $50.",
          },
          {
            title: "Cruelty-Free Only",
            description:
              "We never stock products tested on animals. Leaping Bunny certified brands only.",
          },
        ]

    const categoriesEyebrow = props.categories?.eyebrow ?? "The LUMIÈRE Edit"
    const categoriesHeading = props.categories?.heading ?? "Shop by Category"
    const categoriesDesc =
      props.categories?.description ??
      "Explore our curated collections, from skincare essentials to makeup must-haves."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { name: "Skincare", count: "1,240 products" },
          { name: "Makeup", count: "2,856 products" },
          { name: "Haircare", count: "987 products" },
          { name: "Fragrance", count: "642 products" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Customer Love"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Beauty Lovers Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join over 2 million customers who trust LUMIÈRE for their beauty routine."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've been shopping at LUMIÈRE for 3 years now. The Glow Recipe Dew Drops completely transformed my skincare routine. Customer service is incredible!",
            name: "Sarah Mitchell",
            meta: "Verified Buyer · 12 orders",
            avatarAlt:
              "professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "As a makeup artist, I need products that perform. LUMIÈRE's curation is spot-on. The Rare Beauty blush is now a staple in my professional kit. Fast shipping too!",
            name: "James Chen",
            meta: "Professional MUA · 28 orders",
            avatarAlt:
              "professional headshot of a man with short dark hair and warm smile",
          },
          {
            quote:
              "Finally, a beauty store that understands sensitive skin! The clean beauty filters make shopping so easy. My rosacea-prone skin has never looked better.",
            name: "Emily Rodriguez",
            meta: "Verified Buyer · 7 orders",
            avatarAlt:
              "professional headshot of a young woman with blonde hair and natural makeup",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "5,000+", label: "Curated Products" },
          { value: "2M+", label: "Happy Customers" },
          { value: "4.9/5", label: "Average Rating" },
          { value: "150+", label: "Brand Partners" },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Your Beauty Journey"
    const stepsDesc =
      props.steps?.description ??
      "From discovery to delivery, we've made beauty shopping effortless."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Discover",
            description:
              "Browse our curated collection of 5,000+ clean beauty products.",
          },
          {
            title: "Personalize",
            description:
              "Take our skin quiz to find products perfectly matched to you.",
          },
          {
            title: "Experience",
            description:
              "Enjoy free samples with every order and earn reward points.",
          },
          {
            title: "Glow",
            description:
              "Receive your products with same-day delivery in select cities.",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Got Questions?"
    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about shopping with LUMIÈRE."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your return policy?",
            answer:
              "We offer free returns within 30 days of purchase. All products must be at least 75% full and in original packaging. Simply log into your account, select the order, and print your prepaid return label.",
          },
          {
            question: "Do you ship internationally?",
            answer:
              "Yes! We ship to over 40 countries worldwide. International shipping rates start at $12.99 and vary by destination. Delivery typically takes 5-10 business days depending on your location.",
          },
          {
            question: "How do I know products are truly clean?",
            answer:
              "Our Clean Beauty Promise means every product is vetted against our strict ingredient standards. We ban over 1,600 harmful chemicals and verify cruelty-free certifications with each brand partner.",
          },
          {
            question: "Can I get personalized recommendations?",
            answer:
              "Absolutely! Take our 2-minute Skin Quiz to get products matched to your skin type, concerns, and goals. You can also book a free 15-minute virtual consultation with one of our beauty experts.",
          },
          {
            question: "What is the LUMIÈRE Rewards program?",
            answer:
              "Earn 1 point for every $1 spent. Redeem 100 points for $1 off future purchases. Members also get exclusive early access to sales, birthday gifts, and free shipping on orders over $35.",
          },
          {
            question: "Do you offer gift wrapping?",
            answer:
              "Yes! Add our premium gift wrapping at checkout for $5.99. Each gift includes our signature rose-gold tissue paper, a handwritten card with your message, and a complimentary sample set.",
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Join the LUMIÈRE Family"
    const newsletterDesc =
      props.newsletter?.description ??
      "Get 15% off your first order, exclusive access to new drops, and beauty tips from our experts."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterNote =
      props.newsletter?.note ?? "No spam, ever. Unsubscribe anytime."

    const footerDesc =
      props.footer?.description ??
      "Curated clean beauty for the modern world. We believe everyone deserves to feel confident in their own skin."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "TikTok", "Pinterest"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Shop",
            links: [
              "Bestsellers",
              "New Arrivals",
              "Skincare",
              "Makeup",
              "Haircare",
              "Fragrance",
            ],
          },
          {
            title: "Help",
            links: [
              "Track Order",
              "Returns",
              "Shipping",
              "FAQ",
              "Contact Us",
              "Skin Quiz",
            ],
          },
          {
            title: "About",
            links: [
              "Our Story",
              "Clean Beauty",
              "Careers",
              "Press",
              "Affiliates",
              "Sustainability",
            ],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} ${brand} Beauty. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Decorative inline icons (token-colored via currentColor).
    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const benefitIcons: ReactNode[] = [
      // check-shield (clean beauty)
      <svg
        key="clean"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // clock (delivery)
      <svg
        key="delivery"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart (cruelty-free)
      <svg
        key="cruelty"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    ]

    // Social glyphs (decorative, currentColor).
    const socialPaths: Record<string, string> = {
      Instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      TikTok:
        "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
      Pinterest:
        "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
    }

    // Product corner badge → token rotation (1st=primary, then accent/secondary).
    const badgeClass = (i: number) =>
      [
        "bg-primary text-primary-foreground",
        "bg-foreground text-background",
        "bg-secondary text-secondary-foreground",
        "bg-accent text-accent-foreground",
      ][i % 4]

    return (
      <div
        className={cn(
          "min-h-svh bg-muted/40 font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-2xl font-black tracking-tight text-primary lg:text-3xl"
              >
                {brand}
              </button>

              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go(nav[0])}
                  className="p-2 text-muted-foreground transition-colors hover:text-primary"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Shopping bag"
                  onClick={() => go(nav[0])}
                  className="relative p-2 text-muted-foreground transition-colors hover:text-primary"
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:block"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
            <div
              aria-hidden="true"
              className="absolute right-0 top-20 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-20 size-72 rounded-full bg-accent/30 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {heroEyebrow}
                  </span>
                  <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                    {heroHeadingTop} <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border-2 border-border bg-background px-8 py-4 text-base font-bold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroChips.map((chip) => (
                      <div key={chip} className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-primary" />
                        <span>{chip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-square overflow-hidden rounded-3xl shadow-2xl shadow-primary/20">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={800}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Star className="size-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-card-foreground">
                          {heroRatingValue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroRatingNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press logo strip */}
          <section className="border-y border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoBrands.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-xl font-black text-muted-foreground">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Bestsellers product grid */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {productsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {productsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {productsDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {productItems.map((product, i) => (
                  <article
                    key={product.title}
                    className="group overflow-hidden rounded-2xl bg-muted/40 transition-shadow hover:shadow-xl"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        alt={`${product.brand} ${product.title} product photo`}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.badge ? (
                        <span
                          className={cn(
                            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold",
                            badgeClass(i),
                          )}
                        >
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Add ${product.title} to cart`}
                        onClick={() => go(product.title)}
                        className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-card text-card-foreground opacity-0 shadow-lg transition-opacity hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-semibold text-primary">
                        {product.brand}
                      </p>
                      <h3 className="mb-2 font-bold text-foreground">
                        {product.title}
                      </h3>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex text-primary">
                          {[0, 1, 2, 3, 4].map((s) => (
                            <Star key={s} className="size-4" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.reviews}
                        </span>
                      </div>
                      <p className="text-xl font-black text-foreground">
                        {product.price}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background transition-colors hover:bg-foreground/90"
                >
                  {productsViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {benefitsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {benefitsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {benefitsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {benefitItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-background p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {benefitIcons[i % benefitIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
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

          {/* Shop by category gallery */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {categoriesEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {categoriesDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categoryItems.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => go(cat.name)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl text-left"
                  >
                    <Image
                      alt={`${cat.name} beauty products collection`}
                      w={600}
                      h={750}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="mb-1 text-2xl font-black text-background">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-background/80">{cat.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl bg-background p-8 shadow-sm"
                  >
                    <div className="mb-4 flex text-primary">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
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

          {/* Stats band */}
          <section className="bg-foreground py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statItems.map((stat, i) => (
                  <div key={stat.label}>
                    <p
                      className={cn(
                        "mb-2 text-4xl font-black lg:text-5xl",
                        i === 2 ? "text-primary" : "text-background",
                      )}
                    >
                      {stat.value}
                    </p>
                    <p className="text-background/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works steps */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary">
                      <span className="text-2xl font-black text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ accordion */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="overflow-hidden rounded-xl bg-background shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-bold text-foreground">
                        {item.question}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground"
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
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center sm:p-12 lg:p-16">
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 size-64 rounded-full bg-primary/40 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 size-48 rounded-full bg-accent/40 blur-3xl"
                />
                <div className="relative">
                  <h2 className="mb-4 text-3xl font-black text-primary-foreground sm:text-4xl lg:text-5xl">
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
                    <input
                      type="email"
                      required
                      aria-label="Email address"
                      placeholder={newsletterPlaceholder}
                      className="flex-1 rounded-full border border-input bg-background px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap rounded-full bg-foreground px-8 py-4 font-bold text-background transition-colors hover:bg-foreground/90"
                    >
                      {newsletterSubmit}
                    </button>
                  </form>
                  <p className="mt-4 text-sm text-primary-foreground/70">
                    {newsletterNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="text-2xl font-black tracking-tight text-background"
                >
                  {brand}
                </button>
                <p className="mt-4 max-w-sm text-background/60">{footerDesc}</p>
                <div className="mt-6 flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={socialPaths[social] ?? socialPaths.Instagram} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-background">{col.title}</h4>
                  <ul className="space-y-2 text-background/60">
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
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/60">{footerNote}</p>
              <div className="flex gap-6 text-sm text-background/60">
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
