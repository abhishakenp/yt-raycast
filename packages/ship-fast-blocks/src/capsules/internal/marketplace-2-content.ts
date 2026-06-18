type HeroProduct = { name: string; price: string; alt: string }
type CategoryItem = { title: string; count: string; alt: string }
type StatItem = { value: string; label: string }
type SellerItem = {
  name: string
  shop: string
  rating: string
  reviews: string
  location: string
  avatarAlt: string
  thumbs: string[]
}
type ProductItem = {
  title: string
  seller: string
  price: string
  compareAt?: string
  badge?: string
  alt: string
}
type FeatureItem = { title: string; body: string }
type StepItem = { title: string; body: string }
type TestimonialItem = {
  quote: string
  name: string
  role: string
  avatarAlt: string
}
type FaqItem = { q: string; a: string }
type FooterColumn = { title: string; links: string[] }

export type Marketplace2ContentProps = {
  nav?: string[]
  navbar?: {
    searchPlaceholder?: string
    cartCount?: string
    sellCta?: string
  }
  hero?: {
    badge?: string
    headingLead?: string
    highlight?: string
    headingTail?: string
    subheading?: string
    primaryCta?: string
    secondaryCta?: string
    avatars?: string[]
    proof?: string
    products?: HeroProduct[]
  }
  press?: {
    caption?: string
    logos?: string[]
  }
  categories?: {
    eyebrow?: string
    heading?: string
    description?: string
    viewAll?: string
    items?: CategoryItem[]
  }
  stats?: StatItem[]
  sellers?: {
    eyebrow?: string
    heading?: string
    description?: string
    viewAll?: string
    items?: SellerItem[]
  }
  products?: {
    eyebrow?: string
    heading?: string
    description?: string
    cta?: string
    items?: ProductItem[]
  }
  features?: {
    eyebrow?: string
    heading?: string
    items?: FeatureItem[]
  }
  steps?: {
    eyebrow?: string
    heading?: string
    description?: string
    cta?: string
    note?: string
    items?: StepItem[]
  }
  testimonials?: {
    eyebrow?: string
    heading?: string
    items?: TestimonialItem[]
  }
  faq?: {
    eyebrow?: string
    heading?: string
    items?: FaqItem[]
  }
  cta?: {
    heading?: string
    subheading?: string
    primaryCta?: string
    secondaryCta?: string
    note?: string
  }
  footer?: {
    blurb?: string
    columns?: FooterColumn[]
    copyright?: string
    legal?: string[]
    locale?: string
  }
}

const defaultNav = ['Categories', 'Featured Sellers', 'Trending', 'Deals']

const defaultHeroAvatars = [
  'Customer portrait - smiling woman with curly hair',
  'Customer portrait - man with beard and glasses',
  'Customer portrait - professional woman',
  'Customer portrait - man in casual attire',
]

const defaultHeroProducts: HeroProduct[] = [
  {
    name: 'Modern Timepiece',
    price: '$89.00',
    alt: 'Minimalist white smartwatch on wrist',
  },
  {
    name: 'Audio Elite X3',
    price: '$249.00',
    alt: 'Premium over-ear headphones on warm background',
  },
  {
    name: 'Everyday Tote',
    price: '$129.00',
    alt: 'Canvas tote bag product shot on a neutral background',
  },
  {
    name: 'Vintage Shades',
    price: '$65.00',
    alt: 'Stylish round sunglasses with gold frame',
  },
]

const defaultPressLogos = [
  'Forbes',
  'TechCrunch',
  'WIRED',
  'Bloomberg',
  'Fast Company',
  'The Guardian',
]

const defaultCategories: CategoryItem[] = [
  {
    title: 'Jewelry',
    count: '2.4M items',
    alt: 'Handcrafted silver jewelry necklace close-up',
  },
  {
    title: 'Home & Living',
    count: '4.1M items',
    alt: 'Modern velvet sofa in living room interior',
  },
  {
    title: 'Clothing',
    count: '5.8M items',
    alt: 'Vintage denim jacket and fashion clothing rack',
  },
  {
    title: 'Art & Collectibles',
    count: '1.9M items',
    alt: 'Artisan ceramic pottery vase collection',
  },
  {
    title: 'Vintage',
    count: '3.2M items',
    alt: 'Vintage instant film camera product photography',
  },
  {
    title: 'Craft Supplies',
    count: '2.7M items',
    alt: 'Organic handmade soap and skincare products',
  },
]

const defaultStats: StatItem[] = [
  { value: '12M+', label: 'Unique Products' },
  { value: '85K+', label: 'Verified Sellers' },
  { value: '175', label: 'Countries Served' },
  { value: '$4.2B', label: 'GMV in 2025' },
]

const defaultSellers: SellerItem[] = [
  {
    name: 'Sarah Chen',
    shop: 'Ceramic Studio',
    rating: '4.98',
    reviews: '(12.4K)',
    location: 'Portland, OR',
    avatarAlt: 'Shop owner portrait - female ceramic artist',
    thumbs: [
      'Handmade ceramic vase with blue glaze',
      'Artisan pottery bowl with speckled finish',
      'Ceramic coffee mug with handle',
    ],
  },
  {
    name: 'Marcus Johnson',
    shop: 'Timber & Craft',
    rating: '4.96',
    reviews: '(8.7K)',
    location: 'Austin, TX',
    avatarAlt: 'Shop owner portrait - male furniture maker',
    thumbs: [
      'Mid-century modern wooden chair',
      'Handcrafted oak dining table',
      'Rustic wooden bookshelf',
    ],
  },
  {
    name: 'Elena Rodriguez',
    shop: 'Luna Jewelry',
    rating: '5.00',
    reviews: '(15.2K)',
    location: 'Barcelona, Spain',
    avatarAlt: 'Shop owner portrait - female jewelry designer',
    thumbs: [
      'Dainty gold chain necklace',
      'Sterling silver ring with moonstone',
      'Minimalist gold hoop earrings',
    ],
  },
  {
    name: 'James Wilson',
    shop: 'Heritage Leather',
    rating: '4.94',
    reviews: '(6.3K)',
    location: 'Nashville, TN',
    avatarAlt: 'Shop owner portrait - male leather craftsman',
    thumbs: [
      'Handmade leather messenger bag',
      'Brown leather wallet with stitching',
      'Vintage leather belt with brass buckle',
    ],
  },
]

const defaultProducts: ProductItem[] = [
  {
    title: 'Rare Variegated Monstera',
    seller: 'TheGreenhouseCo • 4.9 ★',
    price: '$85.00',
    compareAt: '$120.00',
    badge: 'Bestseller',
    alt: 'Variegated monstera plant in terracotta pot',
  },
  {
    title: 'Minimal Smartwatch Pro',
    seller: 'TechAtelier • 4.8 ★',
    price: '$149.00',
    badge: 'Just In',
    alt: 'Minimalist white smartwatch with black band',
  },
  {
    title: 'Hand-Embroidered Denim Jacket',
    seller: 'StitchWitchStudio • 5.0 ★',
    price: '$189.00',
    alt: 'Denim jacket with embroidered back patch',
  },
  {
    title: 'Insulated Water Bottle',
    seller: 'EcoVesselCo • 4.9 ★',
    price: '$34.00',
    badge: 'Eco Choice',
    alt: 'Stainless steel reusable water bottle',
  },
  {
    title: 'Handcrafted Wooden Toy Set',
    seller: 'WhittleWonder • 4.97 ★',
    price: '$58.00',
    alt: 'Wooden toy car for children',
  },
  {
    title: 'Abstract Wall Art Print',
    seller: 'ArtistryPrints • 4.85 ★',
    price: '$42.00',
    compareAt: '$65.00',
    alt: 'Abstract canvas art print on wall',
  },
  {
    title: 'Lavender Soy Candle Set',
    seller: 'ScentOfHome • 4.92 ★',
    price: '$24.00',
    compareAt: '$34.00',
    badge: '-30%',
    alt: 'Hand-poured soy wax candle in glass jar',
  },
  {
    title: 'Bohemian Macrame Hanger',
    seller: 'KnotJustCrafts • 4.88 ★',
    price: '$38.00',
    alt: 'Macrame plant hanger with potted plant',
  },
]

const defaultFeatures: FeatureItem[] = [
  {
    title: 'Verified Sellers Only',
    body: 'Every seller undergoes rigorous identity verification and quality checks before listing. Shop with absolute confidence.',
  },
  {
    title: '2-Day Delivery',
    body: 'Our Shipping Network delivers 95% of orders within 2 business days. Real-time tracking from checkout to doorstep.',
  },
  {
    title: 'Buyer Protection',
    body: "100% money-back guarantee on every purchase. If it's not as described, we refund instantly—no questions asked.",
  },
  {
    title: 'Global Reach, Local Feel',
    body: 'Shop from 175 countries with local currency, language, and customs handling built into every transaction.',
  },
  {
    title: 'Support Creators',
    body: '85% of every purchase goes directly to independent sellers. Support small businesses, not corporate giants.',
  },
  {
    title: '24/7 Human Support',
    body: 'Real humans ready to help via chat, email, or phone. Average response time under 3 minutes, 365 days a year.',
  },
]

const defaultSteps: StepItem[] = [
  {
    title: 'Create Your Shop',
    body: 'Sign up free and set up your storefront in under 5 minutes. No technical skills required—just upload and list.',
  },
  {
    title: 'List Products',
    body: 'Add unlimited listings with photos, descriptions, and pricing. Our AI suggests optimal tags for maximum visibility.',
  },
  {
    title: 'Ship & Get Paid',
    body: 'We handle payments securely. Print discounted shipping labels and get paid directly to your bank within 48 hours.',
  },
]

const defaultTestimonials: TestimonialItem[] = [
  {
    quote:
      "I've bought everything from vintage furniture to handmade ceramics here. The quality is consistently amazing and I love knowing I'm supporting real artists, not big corporations.",
    name: 'Amanda Chen',
    role: 'Interior Designer, NYC',
    avatarAlt: 'Customer testimonial portrait - female interior designer',
  },
  {
    quote:
      'As a seller, this platform changed my life. I went from selling at weekend markets to shipping my handmade jewelry worldwide. I hit $10K in my first three months!',
    name: 'Marcus Williams',
    role: 'Shop Owner since 2023',
    avatarAlt: 'Seller testimonial portrait - male jewelry maker',
  },
  {
    quote:
      "The customer service is incredible. When a package got delayed, they reached out before I even noticed. They refunded my shipping and the item arrived perfect. That's how you keep customers for life.",
    name: 'Sarah Mitchell',
    role: '48 orders and counting',
    avatarAlt: 'Customer testimonial portrait - female repeat buyer',
  },
]

const defaultFaq: FaqItem[] = [
  {
    q: 'How does VENDO protect buyers?',
    a: "Every purchase is covered by Buyer Protection. If your item doesn't arrive, arrives damaged, or isn't as described, we refund you in full—including shipping. Just message our 24/7 support team and we'll handle it within 24 hours.",
  },
  {
    q: 'What are the fees for selling?',
    a: "It's completely free to open a shop and list products. We only charge a 5% transaction fee when you make a sale, plus standard payment processing. No monthly fees, no listing fees, no hidden costs. You keep 85%+ of every sale.",
  },
  {
    q: 'How long does shipping take?',
    a: "Domestic orders typically arrive in 2-5 business days. International shipping varies by destination, usually 7-14 days. Every order includes tracking, and you'll receive updates at every step.",
  },
  {
    q: 'Can I return items if I change my mind?',
    a: 'Each seller sets their own return policy, clearly displayed on every listing. Most sellers accept returns within 14-30 days. If the item arrives damaged or not as described, Buyer Protection guarantees your refund.',
  },
  {
    q: 'How do I know sellers are trustworthy?',
    a: 'Every seller completes identity verification before listing. We display their review rating, sales history, and response time. Top sellers earn badges for maintaining 4.8+ ratings and 95% on-time shipping.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and store credits. All transactions are encrypted with bank-level security. We never store your full card number on our servers.',
  },
]

const defaultFooterColumns: FooterColumn[] = [
  {
    title: 'Shop',
    links: ['Gift Cards', 'Sitemap', 'Blog', 'Login', 'Sign Up'],
  },
  {
    title: 'Sell',
    links: [
      'Sell on VENDO',
      'Teams',
      'Forums',
      'Affiliates',
      'Seller Handbook',
    ],
  },
  {
    title: 'About',
    links: ['About Us', 'Policies', 'Investors', 'Careers', 'Press', 'Impact'],
  },
  {
    title: 'Help',
    links: [
      'Help Center',
      'Privacy Policy',
      'Terms of Use',
      'Contact Us',
      'Intellectual Property',
    ],
  },
]

const defaultFooterLegal = ['Privacy', 'Terms', 'Sitemap']

export const resolveMarketplace2Content = (
  props: Marketplace2ContentProps,
  brand: string,
) => ({
  nav: props.nav?.length ? props.nav : defaultNav,
  searchPlaceholder:
    props.navbar?.searchPlaceholder ?? 'Search 12M+ products...',
  cartCount: props.navbar?.cartCount ?? '3',
  sellCta: props.navbar?.sellCta ?? 'Sell on VENDO',
  heroBadge:
    props.hero?.badge ??
    'Live Now: Summer Marketplace Festival — Up to 60% off',
  heroLead: props.hero?.headingLead ?? 'Discover',
  heroHighlight: props.hero?.highlight ?? 'Unique',
  heroTail: props.hero?.headingTail ?? 'Products from Global Creators',
  heroSub:
    props.hero?.subheading ??
    'Shop 12 million+ handcrafted, vintage, and one-of-a-kind items from 85,000+ verified sellers across 175 countries.',
  heroPrimary: props.hero?.primaryCta ?? 'Start Exploring',
  heroSecondary: props.hero?.secondaryCta ?? 'Become a Seller',
  heroAvatars: props.hero?.avatars?.length
    ? props.hero.avatars
    : defaultHeroAvatars,
  heroProof: props.hero?.proof ?? 'Trusted by 4.2M+ happy shoppers',
  heroProducts: props.hero?.products?.length
    ? props.hero.products
    : defaultHeroProducts,
  pressCaption: props.press?.caption ?? 'Featured in leading publications',
  pressLogos: props.press?.logos?.length
    ? props.press.logos
    : defaultPressLogos,
  catEyebrow: props.categories?.eyebrow ?? 'Explore',
  catHeading: props.categories?.heading ?? 'Shop by Category',
  catDesc:
    props.categories?.description ??
    'From handmade jewelry to vintage furniture, discover products curated by passionate sellers worldwide.',
  catViewAll: props.categories?.viewAll ?? 'View all 45 categories',
  catItems: props.categories?.items?.length
    ? props.categories.items
    : defaultCategories,
  stats: props.stats?.length ? props.stats : defaultStats,
  sellersEyebrow: props.sellers?.eyebrow ?? 'Curated Creators',
  sellersHeading: props.sellers?.heading ?? 'Featured Sellers',
  sellersDesc:
    props.sellers?.description ??
    'Meet our top-rated artisans and shop owners with impeccable ratings and thousands of happy customers.',
  sellersViewAll: props.sellers?.viewAll ?? 'Explore all sellers',
  sellerItems: props.sellers?.items?.length
    ? props.sellers.items
    : defaultSellers,
  prodEyebrow: props.products?.eyebrow ?? 'Trending Now',
  prodHeading: props.products?.heading ?? "Products Everyone's Talking About",
  prodDesc:
    props.products?.description ??
    'Handpicked favorites from our global marketplace, updated hourly based on sales velocity and customer love.',
  prodCta: props.products?.cta ?? 'View All Trending Products',
  prodItems: props.products?.items?.length
    ? props.products.items
    : defaultProducts,
  featEyebrow: props.features?.eyebrow ?? 'Why VENDO',
  featHeading: props.features?.heading ?? 'The Marketplace Built Different',
  featItems: props.features?.items?.length
    ? props.features.items
    : defaultFeatures,
  stepsEyebrow: props.steps?.eyebrow ?? 'Simple Process',
  stepsHeading: props.steps?.heading ?? 'Start Selling in Minutes',
  stepsDesc:
    props.steps?.description ??
    'Join 85,000+ creators who turned their passion into profit.',
  stepsCta: props.steps?.cta ?? 'Open Your Shop Free',
  stepsNote:
    props.steps?.note ??
    '$0 to start • No monthly fees • Only 5% when you sell',
  stepItems: props.steps?.items?.length ? props.steps.items : defaultSteps,
  testEyebrow: props.testimonials?.eyebrow ?? 'Love from Our Community',
  testHeading: props.testimonials?.heading ?? 'What Shoppers Say',
  testItems: props.testimonials?.items?.length
    ? props.testimonials.items
    : defaultTestimonials,
  faqEyebrow: props.faq?.eyebrow ?? 'Support',
  faqHeading: props.faq?.heading ?? 'Common Questions',
  faqItems: props.faq?.items?.length ? props.faq.items : defaultFaq,
  ctaHeading: props.cta?.heading ?? 'Ready to Start Your Journey?',
  ctaSub:
    props.cta?.subheading ??
    "Whether you're hunting for something unique or ready to turn your craft into income, this is your marketplace.",
  ctaPrimary: props.cta?.primaryCta ?? 'Start Shopping',
  ctaSecondary: props.cta?.secondaryCta ?? 'Open a Shop',
  ctaNote:
    props.cta?.note ??
    'Join 4.2 million happy shoppers and 85,000+ sellers worldwide',
  footerBlurb:
    props.footer?.blurb ??
    'The global marketplace for unique and creative goods. Discover extraordinary items from independent sellers.',
  footerColumns: props.footer?.columns?.length
    ? props.footer.columns
    : defaultFooterColumns,
  footerCopyright:
    props.footer?.copyright ??
    `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`,
  footerLegal: props.footer?.legal?.length
    ? props.footer.legal
    : defaultFooterLegal,
  footerLocale: props.footer?.locale ?? 'United States | English (US) | $ USD',
})
