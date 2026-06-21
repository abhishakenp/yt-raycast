import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * ElectronicsStoreKimiPage2 — a dark, high-contrast electronics and gadgets
 * e-commerce STOREFRONT / home page variant. The second style sibling to
 * ElectronicsStoreKimiPage with a moody, immersive dark theme featuring a
 * split hero with animated sale badge and gradient text, a trusted-brand logo
 * strip, a 4-up features grid, a dark stats band, an 8-product deals grid with
 * discount badges, a 3-tier bundle pricing section with a highlighted Most
 * Popular tier, a numbered step-by-step how-it-works flow, verified-buyer
 * testimonials with star ratings, an FAQ accordion, a vibrant newsletter CTA
 * with email capture, and a multi-column footer with social icons and payment
 * methods. Use when a bold, dark, conversion-focused electronics store page
 * with heavy product density, bundle upsells, and social proof is wanted.
 */
export const ElectronicsStoreKimiPage2 = defineCapsule({
  name: 'ElectronicsStoreKimiPage2',
  description:
    "A dark, high-contrast electronics and gadgets e-commerce STOREFRONT / home page block that is the second style sibling to ElectronicsStoreKimiPage, offering a moody, immersive dark aesthetic rather than the clean light canvas of the first variant. Features a sticky navbar with search, cart and Shop Now CTA, a split hero with an animated 'Summer Tech Sale Live' pulse badge, bold gradient headline, dual CTAs and a social-proof avatar stack with star ratings and customer count, a hero image with a floating 'Free Express Shipping' guarantee card, a trusted-tech-brand logo strip (Apple, Samsung, Sony, Bose, Logitech, Nvidia), a 4-up benefits grid (Free Fast Shipping, 2-Year Warranty, 30-Day Returns, 24/7 Expert Support), a high-contrast stats band (50K+ shipped, 12.4K customers, 4.9/5 rating, 24h support), an 8-product deals grid with discount badges, category tags, star ratings and floating add-to-cart buttons (Sony WH-1000XM5, Apple Watch, Keychron, Galaxy S25 Ultra, iPad Pro, Bose QC Ultra, Meta Quest 3, JBL Flip 6), a 3-tier bundle pricing section with a highlighted Creator Pro 'Most Popular' tier and checklist features, a 4-step numbered How It Works flow with a connecting gradient line, a 3-up verified-buyer testimonials row with 5-star ratings and avatars, a 6-item FAQ accordion, a vibrant newsletter CTA with email capture form, and a multi-column footer with brand story, social links (Twitter, Instagram, YouTube, Discord), Shop / Support / Company columns, copyright and payment method imagery. All nav items, CTAs, footer links and form submits route through useNavigate. Surfaces map strictly to semantic tokens so the block is theme-injectable later.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        floatTitle: z.string().optional(),
        floatDesc: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        caption: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .array(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    stats: z
      .array(
        z.object({
          value: z.string().optional(),
          label: z.string().optional(),
        }),
      )
      .optional(),
    products: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string().optional(),
              title: z.string().optional(),
              description: z.string().optional(),
              price: z.string().optional(),
              originalPrice: z.string().optional(),
              discount: z.string().optional(),
              rating: z.string().optional(),
              imageAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    bundles: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string().optional(),
              price: z.string().optional(),
              originalPrice: z.string().optional(),
              isPopular: z.boolean().optional(),
              includes: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string().optional(),
              title: z.string().optional(),
              description: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string().optional(),
              name: z.string().optional(),
              role: z.string().optional(),
              avatarAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              q: z.string().optional(),
              a: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string().optional(),
              links: z.array(z.string()).optional(),
            }),
          )
          .optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      products: table({
        category: string(),
        title: string(),
        description: string(),
        price: string(),
        originalPrice: string(),
        discount: string(),
        rating: string(),
        imageAlt: string(),
      }),
      cartItems: table({
        productId: string(),
        quantity: number(),
      }),
      favorites: table({
        productName: string(),
      }),
    },
    queries: {
      products: ({ db }) => db.products.orderBy('createdAt').all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const product = db.products.get(item.productId)
          return product ? [{ ...item, product }] : []
        }),
      favoriteProductNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.productName)),
    },
    mutations: {
      addToCart: ({ db }, productName: string) => {
        const product = db.products.where('title', productName).all()[0]
        if (!product) return db.cartItems.all()

        const existingItem = db.cartItems
          .where('productId', product.id)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            productId: product.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, productId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where('productId', productId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, productId: string) => {
        for (const item of db.cartItems.where('productId', productId).all()) {
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
      toggleFavorite: ({ db }, productName: string) => {
        const existingFavorite = db.favorites
          .where('productName', productName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ productName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)

    const priceAmount = (price: string | undefined) => {
      const amount = Number.parseFloat((price ?? '').replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    const brand = props.brand ?? 'VoltCity'
    const nav = props.nav?.length
      ? props.nav
      : ['Deals', 'Products', 'How It Works', 'Reviews', 'FAQ']

    const heroBadge = props.hero?.badge ?? 'Summer Tech Sale Live'
    const heroHeading = props.hero?.heading ?? 'Power Up Your'
    const heroHighlight = props.hero?.highlight ?? 'Digital Life'
    const heroSub =
      props.hero?.subheading ??
      'Discover cutting-edge gadgets, premium audio, smart home tech, and gaming gear. Up to 60% off flagship devices through June 15.'
    const heroPrimary = props.hero?.primaryCta ?? 'Shop Deals'
    const heroSecondary = props.hero?.secondaryCta ?? 'Learn More'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'collection of modern electronics and gadgets arranged on a dark surface'
    const heroFloatTitle = props.hero?.floatTitle ?? 'Free Express Shipping'
    const heroFloatDesc = props.hero?.floatDesc ?? 'On orders over $99'

    const logosCaption =
      props.logos?.caption ?? 'Trusted by leading tech brands'
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ['Apple', 'Samsung', 'Sony', 'Bose', 'Logitech', 'Nvidia']

    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Free Fast Shipping',
            description:
              'Free 2-day express on orders over $99. Same-day delivery available in 40+ metro areas.',
          },
          {
            title: '2-Year Warranty',
            description:
              'Every product comes with our hassle-free 2-year warranty. No questions asked replacements.',
          },
          {
            title: '30-Day Returns',
            description:
              'Changed your mind? Return any item within 30 days for a full refund. We even cover return shipping.',
          },
          {
            title: '24/7 Expert Support',
            description:
              'Our tech-savvy support team is available round the clock via chat, email, or phone.',
          },
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '50K+', label: 'Products Shipped' },
          { value: '12.4K', label: 'Happy Customers' },
          { value: '4.9/5', label: 'Average Rating' },
          { value: '24h', label: 'Support Response' },
        ]

    const productsHeading = props.products?.heading ?? "This Week's Deals"
    const productsSub =
      props.products?.subheading ??
      'Hand-picked discounts on premium tech. Sale ends June 15, 2026.'
    const productsViewAll = props.products?.viewAll ?? 'View All Products'
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            category: 'Audio',
            title: 'Sony WH-1000XM5',
            description: 'Industry-leading noise canceling wireless headphones',
            price: '$279',
            originalPrice: '$429',
            discount: '-35%',
            rating: '4.8',
            imageAlt:
              'over-ear wireless headphones with matte black finish and cushioned ear cups',
          },
          {
            category: 'Wearables',
            title: 'Apple Watch Series 10',
            description: 'Advanced health sensors, always-on Retina display',
            price: '$299',
            originalPrice: '$399',
            discount: '-25%',
            rating: '4.9',
            imageAlt:
              'white smartwatch with round face and silicone band displayed on wrist',
          },
          {
            category: 'Gaming',
            title: 'Keychron Q1 Pro',
            description: 'Wireless custom mechanical keyboard, QMK/VIA',
            price: '$119',
            originalPrice: '$199',
            discount: '-40%',
            rating: '4.7',
            imageAlt:
              'compact mechanical gaming keyboard with RGB backlighting',
          },
          {
            category: 'Smartphones',
            title: 'Galaxy S25 Ultra',
            description: '200MP camera, S Pen, titanium frame, AI powered',
            price: '$1,039',
            originalPrice: '$1,299',
            discount: '-20%',
            rating: '4.8',
            imageAlt:
              'modern smartphone with edge-to-edge OLED display showing colorful wallpaper',
          },
          {
            category: 'Tablets',
            title: 'iPad Pro 13" M4',
            description: 'Ultra Retina XDR, M4 chip, professional creativity',
            price: '$909',
            originalPrice: '$1,299',
            discount: '-30%',
            rating: '4.9',
            imageAlt: 'sleek tablet with stylus pen on a wooden desk',
          },
          {
            category: 'Audio',
            title: 'Bose QuietComfort Ultra',
            description: 'Spatial audio, world-class noise cancellation',
            price: '$164',
            originalPrice: '$299',
            discount: '-45%',
            rating: '4.6',
            imageAlt:
              'wireless earbuds in an open charging case with LED indicator',
          },
          {
            category: 'VR',
            title: 'Meta Quest 3',
            description: 'Mixed reality, 4K+ Infinite Display, Snapdragon XR2',
            price: '$424',
            originalPrice: '$499',
            discount: '-15%',
            rating: '4.7',
            imageAlt: 'VR headset with controllers on a dark background',
          },
          {
            category: 'Audio',
            title: 'JBL Flip 6',
            description: 'Waterproof portable speaker, 12 hours playtime',
            price: '$64',
            originalPrice: '$129',
            discount: '-50%',
            rating: '4.5',
            imageAlt:
              'portable bluetooth speaker with cylindrical shape and fabric mesh exterior',
          },
        ]

    const normalizedProductItems = productItems.map((product) => ({
      category: product.category ?? '',
      title: product.title ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      discount: product.discount ?? '',
      rating: product.rating ?? '',
      imageAlt: product.imageAlt ?? '',
    }))

    const storedProducts = lakebed.useQuery('products')
    const cartLines = lakebed.useQuery('cartLines')
    const favoriteProductNames = lakebed.useQuery('favoriteProductNames')
    const auth = lakebed.useAuth()
    const addToCart = lakebed.useMutation('addToCart')
    const updateCartQuantity = lakebed.useMutation('updateCartQuantity')
    const removeFromCart = lakebed.useMutation('removeFromCart')
    const clearCart = lakebed.useMutation('clearCart')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const displayProducts = (
      storedProducts && storedProducts.length > 0
        ? storedProducts
        : normalizedProductItems
    ).map((product) => ({
      category: product.category ?? '',
      title: product.title ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      discount: product.discount ?? '',
      rating: product.rating ?? '',
      imageAlt: product.imageAlt ?? '',
    }))
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.product.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 99 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    const bundlesHeading = props.bundles?.heading ?? 'Bundle & Save'
    const bundlesSub =
      props.bundles?.subheading ??
      'Curated tech bundles at unbeatable prices. Perfect for upgrading your setup.'
    const bundleItems = props.bundles?.items?.length
      ? props.bundles.items
      : [
          {
            name: 'Work From Home',
            price: '$199',
            originalPrice: '$289',
            isPopular: false,
            includes: [
              'Logitech MX Master 3S Mouse',
              'Keychron K3 Ultra-Slim Keyboard',
              'Anker 737 Power Bank 24K mAh',
              'USB-C Hub 7-in-1 Adapter',
            ],
          },
          {
            name: 'Creator Pro',
            price: '$449',
            originalPrice: '$679',
            isPopular: true,
            includes: [
              'Sony ZV-E10 II Vlog Camera',
              'Rode VideoMic Pro+ Shotgun Mic',
              'Elgato Key Light Air LED Panel',
              '256GB SDXC UHS-II Memory Card',
              'Premium Carrying Case',
            ],
          },
          {
            name: 'Gaming Elite',
            price: '$899',
            originalPrice: '$1,249',
            isPopular: false,
            includes: [
              'SteelSeries Arctis Nova Pro Wireless',
              'Razer DeathAdder V3 Pro Mouse',
              'Corsair K70 RGB Pro Keyboard',
              '27" LG UltraGear QHD 165Hz Monitor',
            ],
          },
        ]

    const stepsHeading = props.steps?.heading ?? 'How It Works'
    const stepsSub =
      props.steps?.subheading ??
      'From browsing to unboxing in four simple steps.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            number: '01',
            title: 'Browse & Compare',
            description:
              'Explore thousands of products with detailed specs, real reviews, and expert guides.',
          },
          {
            number: '02',
            title: 'Add to Cart',
            description:
              'Build your order with bundles for extra savings. Apply promo codes at checkout.',
          },
          {
            number: '03',
            title: 'Fast Shipping',
            description:
              'Free 2-day express delivery. Track your package in real-time from warehouse to door.',
          },
          {
            number: '04',
            title: 'Enjoy & Review',
            description:
              'Unbox, set up, and love your new tech. Share your experience and earn loyalty points.',
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? 'What Our Customers Say'
    const testimonialsSub =
      props.testimonials?.subheading ??
      'Real reviews from real tech lovers. Verified purchases only.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'Ordered the Sony WH-1000XM5 on Monday, had them Tuesday afternoon. The price beat Amazon by $40 and the packaging was pristine. VoltCity is now my go-to for audio gear.',
            name: 'Marcus Chen',
            role: 'Audio Engineer, Austin TX',
            avatarAlt:
              'professional headshot of a man in his thirties with short brown hair and a friendly smile',
          },
          {
            quote:
              'The Creator Pro bundle saved me over $200 on my vlogging setup. Everything arrived in one box, perfectly packed. The camera guide they emailed was a nice touch too.',
            name: 'Sofia Reyes',
            role: 'YouTuber, Los Angeles CA',
            avatarAlt:
              'professional headshot of a young woman with dark hair and warm smile',
          },
          {
            quote:
              'Had a minor issue with my mechanical keyboard. Support responded in 8 minutes and sent a replacement same day. That level of service is rare these days. Highly recommended.',
            name: 'David Okafor',
            role: 'Software Developer, Seattle WA',
            avatarAlt:
              'professional headshot of a man with a beard wearing a dark sweater',
          },
        ]

    const faqHeading = props.faq?.heading ?? 'Questions & Answers'
    const faqSub =
      props.faq?.subheading ?? 'Everything you need to know before you buy.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: 'Do you ship internationally?',
            a: 'Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location. US customers enjoy free 2-day express shipping on orders over $99. International orders typically arrive within 5-10 business days.',
          },
          {
            q: 'What is your return policy?',
            a: 'We offer a 30-day no-questions-asked return policy on all unopened items. For opened items, returns are accepted within 30 days if the product is in like-new condition with all original packaging. We even cover return shipping for defective or incorrect items.',
          },
          {
            q: 'Are your products covered by warranty?',
            a: 'Every product sold on VoltCity comes with our complimentary 2-year VoltCare warranty. This covers manufacturing defects and hardware failures. Manufacturer warranties also apply where applicable and may extend beyond our coverage period.',
          },
          {
            q: 'How do I track my order?',
            a: "Once your order ships, you will receive an email with a tracking number and a link to our real-time tracking portal. You can also track orders by logging into your VoltCity account and visiting the 'My Orders' section.",
          },
          {
            q: 'Do you offer price matching?',
            a: 'Absolutely. If you find a lower price on an identical in-stock item from an authorized retailer within 14 days of purchase, we will match it and beat it by 5%. Just contact our support team with proof of the lower price.',
          },
          {
            q: 'Can I cancel or modify my order?',
            a: 'Orders can be modified or canceled within 1 hour of placing them, or until they enter the warehouse processing stage whichever comes first. Contact support immediately for fastest assistance. Once shipped, orders cannot be canceled but can be returned.',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to Upgrade?'
    const ctaDesc =
      props.cta?.description ??
      'Join 12,000+ tech enthusiasts who shop smarter. Get exclusive early access to drops, flash sales, and member-only discounts delivered to your inbox.'
    const ctaPlaceholder = props.cta?.placeholder ?? 'Enter your email'
    const ctaSubmit = props.cta?.submit ?? 'Subscribe'
    const ctaDisclaimer =
      props.cta?.disclaimer ?? 'No spam, ever. Unsubscribe anytime.'
    const ctaImageAlt =
      props.cta?.imageAlt ??
      'modern gadgets and devices neatly arranged on a clean white desk'

    const footerDesc =
      props.footer?.description ??
      'Your trusted destination for premium electronics and gadgets. Free shipping, expert support, and prices that beat the big box stores.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Best Sellers',
              'Deals & Bundles',
              'Audio & Headphones',
              'Smart Home',
              'Gaming Gear',
            ],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Order Status',
              'Shipping Info',
              'Returns & Exchanges',
              'Warranty Claims',
              'Contact Us',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Press',
              'Affiliate Program',
              'Privacy Policy',
              'Terms of Service',
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5', className)}
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-4', className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0 mt-0.5', className)}
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
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const SocialIcon = ({ path }: { path: string }) => (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    )

    const featureIconSvgs = [
      <svg
        key="ship"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      <svg
        key="shield"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg
        key="refresh"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
      <svg
        key="support"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    const socials = [
      {
        label: 'Twitter',
        path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      },
      {
        label: 'Instagram',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      },
      {
        label: 'YouTube',
        path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
      },
      {
        label: 'Discord',
        path: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
      },
    ]

    const paymentAlts = [
      'Visa credit card logo',
      'Mastercard credit card logo',
      'American Express credit card logo',
      'PayPal payment logo',
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 group"
              aria-label={`${brand} Home`}
            >
              <svg
                className="size-8 text-primary transition-colors group-hover:text-primary/80"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-2xl font-black tracking-tight text-foreground">
                {brand}
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
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
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Orders')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Orders
                        <ArrowRight />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Shopping Cart"
                    className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItemCount > 0 ? (
                      <span className="absolute right-0 top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
                    <SheetTitle className="text-xl">Shopping cart</SheetTitle>
                    <SheetDescription>
                      {cartItemCount > 0
                        ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} ready for checkout.`
                        : 'Your cart is empty.'}
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
                                alt={item.product.imageAlt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {item.product.category || brand}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.product.title}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    priceAmount(item.product.price) *
                                      item.quantity,
                                  )}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        item.productId,
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
                                        item.productId,
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
                                  onClick={() =>
                                    void removeFromCart(item.productId)
                                  }
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
                          Add an item from This Week's Deals to start a cart for
                          this session.
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
                          {shipping ? formatCurrency(shipping) : 'Free'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!safeCartLines.length}
                      className="w-full rounded-full"
                      onClick={() => go('Checkout')}
                    >
                      Checkout
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearCart()}
                        disabled={!safeCartLines.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search products"
          description="Search the products seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} products...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup heading="Products">
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.title}
                  value={`${product.category} ${product.title} ${product.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(product.title)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={product.imageAlt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {product.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.category || brand}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {product.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden"
            aria-label="Hero banner"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent" />
            <div className="absolute -right-40 -top-40 size-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {heroBadge}
                    </span>
                  </div>

                  <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                    {heroHeading}{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                      {heroHighlight}
                    </span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-xl border border-border bg-muted px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      <Image
                        alt="professional headshot of a smiling man with glasses"
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                      <Image
                        alt="professional headshot of a young woman with curly hair smiling"
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                      <Image
                        alt="professional headshot of a man with a beard smiling"
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                      <Image
                        alt="professional headshot of a woman with blonde hair"
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-4 text-chart-4" />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <strong className="text-foreground">12,400+</strong>{' '}
                        happy customers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-destructive-foreground">
                      -40% Off
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Check className="size-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {heroFloatTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroFloatDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-muted/50"
            aria-label="Partner brands"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {logosCaption}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
                {logoBrands.map((b) => (
                  <span
                    key={b}
                    className="text-sm font-bold text-foreground transition-colors hover:text-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 sm:py-28" aria-label="Why shop with us">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Why Choose {brand}
                </h2>
                <p className="text-lg text-muted-foreground">
                  We do not just sell gadgets. We deliver peace of mind with
                  every order.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIconSvgs[i % featureIconSvgs.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="border-y border-border bg-muted/50 py-16"
            aria-label="Company statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-black text-primary sm:text-4xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Products */}
          <section
            id="products"
            className="py-20 sm:py-28"
            aria-label="Product catalog"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {productsHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{productsSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {productsViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayProducts.map((p) => {
                  const isFavorite = favoriteProductNames?.has(p.title) ?? false

                  return (
                    <article
                      key={p.title}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          alt={p.imageAlt ?? ''}
                          w={600}
                          h={600}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 rounded-md bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                          {p.discount}
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(p.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${p.title} from favorites`
                              : `Add ${p.title} to favorites`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-5">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                          {p.category}
                        </p>
                        <h3 className="mb-1 font-bold text-foreground transition-colors group-hover:text-primary">
                          {p.title}
                        </h3>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-foreground">
                              {p.price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {p.originalPrice}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="size-4 text-chart-4" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {p.rating}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-full mt-4"
                          onClick={() => {
                            void addToCart(p.title)
                            setCartOpen(true)
                          }}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Bundles */}
          <section
            id="deals"
            className="py-20 sm:py-28 bg-muted/40"
            aria-label="Bundle deals"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {bundlesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{bundlesSub}</p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {bundleItems.map((b) => (
                  <div
                    key={b.name}
                    className={cn(
                      'relative rounded-2xl border bg-card p-8 transition-all',
                      b.isPopular
                        ? 'border-2 border-primary shadow-xl'
                        : 'border-border hover:border-border/70',
                    )}
                  >
                    {b.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <h3
                      className={cn(
                        'mb-2 text-lg font-bold',
                        b.isPopular ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {b.name}
                    </h3>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">
                        {b.price}
                      </span>
                      <span className="text-muted-foreground line-through">
                        {b.originalPrice}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {b.includes?.map((item) => (
                        <li
                          key={item}
                          className={cn(
                            'flex items-start gap-3 text-sm',
                            b.isPopular
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          <Check className="text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      onClick={() => {
                        void addToCart(b.name ?? '')
                        setCartOpen(true)
                      }}
                      className={cn(
                        'w-full rounded-xl py-3 font-semibold transition-colors',
                        b.isPopular
                          ? 'bg-primary font-bold text-primary-foreground hover:bg-primary/90'
                          : 'border border-border bg-muted text-foreground hover:bg-accent',
                      )}
                    >
                      Add Bundle
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            id="how-it-works"
            className="py-20 sm:py-28"
            aria-label="How it works"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsSub}</p>
              </div>

              <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-0.5 bg-gradient-to-r from-border via-primary/30 to-border lg:block" />
                {stepItems.map((s) => (
                  <div key={s.number} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border-2 border-primary bg-card">
                      <span className="text-2xl font-black text-primary">
                        {s.number}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            className="border-y border-border bg-muted/40 py-20 sm:py-28"
            aria-label="Customer reviews"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsSub}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/70"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt ?? ''}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="py-20 sm:py-28"
            aria-label="Frequently asked questions"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqSub}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                      <span className="font-semibold text-foreground">
                        {item.q}
                      </span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="cta"
            className="py-20 sm:py-28"
            aria-label="Call to action"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary-foreground/10 to-transparent" />
                <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary-foreground/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-primary-foreground/5 blur-3xl" />

                <div className="relative grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
                  <div>
                    <h2 className="mb-4 text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                      {ctaHeading}
                    </h2>
                    <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                      {ctaDesc}
                    </p>
                    <form
                      className="flex flex-col gap-3 sm:flex-row"
                      onSubmit={(e) => {
                        e.preventDefault()
                        go(ctaSubmit)
                      }}
                    >
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder={ctaPlaceholder}
                        className="flex-1 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3.5 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                      />
                      <Button
                        type="submit"
                        className="rounded-xl bg-primary-foreground px-8 py-3.5 font-bold text-primary transition-colors hover:bg-primary-foreground/90 shadow-lg"
                      >
                        {ctaSubmit}
                      </Button>
                    </form>
                    <p className="mt-3 text-xs text-primary-foreground/60">
                      {ctaDisclaimer}
                    </p>
                  </div>
                  <div className="hidden justify-center lg:flex">
                    <Image
                      alt={ctaImageAlt}
                      w={500}
                      h={400}
                      className="rounded-2xl border border-primary-foreground/10 shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-background pb-8 pt-16"
          aria-label="Site footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="sm:col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <svg
                    className="size-7 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className="text-xl font-black text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex items-center gap-4">
                  {socials.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      onClick={() => go(s.label)}
                      className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-border/70 hover:text-foreground"
                    >
                      <SocialIcon path={s.path} />
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links?.map((link) => (
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-xs text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-4">
                {paymentAlts.map((alt) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={60}
                    h={40}
                    className="h-6 opacity-50"
                  />
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
