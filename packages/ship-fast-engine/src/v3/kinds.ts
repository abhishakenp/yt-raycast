// v3 kind table (17) + keyword-based inference + confidence scoring.
import type { ConfidenceResult, KindEntry } from './types.ts'

export const KINDS: KindEntry[] = [
  {
    kind: 'commerce',
    defaultFamily: 'Ecommerce',
    keywordHints: ['store', 'shop', 'buy', 'sell', 'product', 'goods', 'merch'],
    covers: [
      'FashionStore',
      'ElectronicsStore',
      'JewelryStore',
      'FurnitureStore',
      'BeautyStore',
      'Ecommerce',
      'SubscriptionBox',
    ],
  },
  {
    kind: 'restaurant',
    defaultFamily: 'Restaurant',
    keywordHints: [
      'restaurant',
      'dining',
      'food',
      'menu',
      'chef',
      'cuisine',
      'bistro',
      'eatery',
    ],
    covers: [
      'Restaurant',
      'Cafe',
      'Bakery',
      'BarNightclub',
      'FoodTruck',
      'FoodDelivery',
      'WineryBrewery',
    ],
  },
  {
    kind: 'saas',
    defaultFamily: 'Saas',
    keywordHints: [
      'saas',
      'software',
      'api',
      'developer',
      'tool',
      'platform',
      'dashboard',
      'analytics',
    ],
    covers: [
      'Saas',
      'DevTool',
      'Crm',
      'CloudInfra',
      'Cybersecurity',
      'NoCode',
      'AiProduct',
      'Auth',
    ],
  },
  {
    kind: 'finance',
    defaultFamily: 'Fintech',
    keywordHints: [
      'fintech',
      'finance',
      'banking',
      'payments',
      'wallet',
      'lending',
      'loan',
      'invest',
      'money',
    ],
    covers: [
      'Fintech',
      'Lending',
      'Investing',
      'Crypto',
      'Insurance',
      'AccountingFirm',
    ],
  },
  {
    kind: 'marketplace',
    defaultFamily: 'Marketplace',
    keywordHints: [
      'marketplace',
      'vendors',
      'sellers',
      'multivendor',
      'classifieds',
      'buyers',
    ],
    covers: ['Marketplace', 'Directory'],
  },
  {
    kind: 'realestate',
    defaultFamily: 'RealEstate',
    keywordHints: [
      'estate',
      'realtor',
      'property',
      'homes',
      'rental',
      'housing',
      'apartment',
      'mortgage',
    ],
    covers: [
      'RealEstate',
      'PropertyListing',
      'VacationRental',
      'InteriorDesign',
    ],
  },
  {
    kind: 'healthcare',
    defaultFamily: 'Healthcare',
    keywordHints: [
      'telehealth',
      'doctor',
      'clinic',
      'medical',
      'patient',
      'dental',
      'therapy',
    ],
    covers: [
      'Telehealth',
      'Healthcare',
      'Dental',
      'MentalHealth',
      'PetVeterinary',
    ],
  },
  {
    kind: 'portfolio',
    defaultFamily: 'Portfolio',
    keywordHints: [
      'portfolio',
      'designer',
      'artist',
      'creative',
      'photographer',
      'freelance',
    ],
    covers: [
      'Portfolio',
      'Photography',
      'Illustrator',
      'FilmDirector',
      'MusicArtist',
      'Agency',
      'MarketingAgency',
    ],
  },
  {
    kind: 'publication',
    defaultFamily: 'Newsroom',
    keywordHints: [
      'news',
      'magazine',
      'newsroom',
      'editorial',
      'press',
      'journal',
      'publication',
      'blog',
    ],
    covers: ['Newsroom', 'Newsletter', 'Blog', 'Podcast', 'WriterAuthor'],
  },
  {
    kind: 'service',
    defaultFamily: 'CleaningService',
    keywordHints: [
      'service',
      'cleaning',
      'plumbing',
      'hvac',
      'landscaping',
      'salon',
      'spa',
      'fitness',
      'yoga',
      'gym',
    ],
    covers: [
      'CleaningService',
      'PlumbingHvac',
      'Landscaping',
      'SalonBarber',
      'SpaWellness',
      'Fitness',
      'YogaStudio',
    ],
  },
  {
    kind: 'education',
    defaultFamily: 'Bootcamp',
    keywordHints: [
      'bootcamp',
      'course',
      'education',
      'tutor',
      'university',
      'kids',
      'learning',
    ],
    covers: [
      'Bootcamp',
      'OnlineCourse',
      'KidsEducation',
      'Tutoring',
      'University',
    ],
  },
  {
    kind: 'events',
    defaultFamily: 'Event',
    keywordHints: [
      'event',
      'wedding',
      'festival',
      'planner',
      'conference',
      'meetup',
    ],
    covers: ['Event', 'EventPlanner', 'Wedding', 'MusicFestival'],
  },
  {
    kind: 'travel',
    defaultFamily: 'HotelResort',
    keywordHints: [
      'hotel',
      'resort',
      'travel',
      'tour',
      'vacation',
      'hospitality',
    ],
    covers: ['HotelResort', 'TourExperiences', 'TravelAgency'],
  },
  {
    kind: 'government',
    defaultFamily: 'Nonprofit',
    keywordHints: [
      'government',
      'public',
      'sector',
      'civic',
      'municipal',
      'portal',
      'ministry',
    ],
    covers: ['Nonprofit', 'Church'],
  },
  {
    kind: 'logistics',
    defaultFamily: 'Logistics',
    keywordHints: [
      'logistics',
      'manufacturing',
      'construction',
      'automotive',
      'dealership',
      'shipping',
    ],
    covers: ['Logistics', 'Manufacturing', 'Construction', 'AutoDealership'],
  },
  {
    kind: 'jobs',
    defaultFamily: 'JobBoard',
    keywordHints: ['job', 'jobs', 'career', 'hiring', 'recruitment', 'board'],
    covers: ['JobBoard', 'ComingSoon', 'LinkInBio', 'ResumeCv'],
  },
  {
    kind: 'marketing',
    defaultFamily: 'Marketing',
    keywordHints: [],
    covers: [
      'Marketing',
      'Consulting',
      'Corporate',
      'Coworking',
      'DatingApp',
      'MobileApp',
      'Webinar',
      'CommunityForum',
      'KnowledgeBase',
      'Docs',
      'Crowdfunding',
      'MembershipClub',
      'Nutrition',
      'VideoStreaming',
    ],
  },
]

export const KIND_NAMES: string[] = KINDS.map((k) => k.kind)

const DEFAULT_TOP3 = ['marketing', 'saas', 'restaurant']

// tokenize: lowercase, split on non-alphanumerics, drop short tokens (matches v2-compose).
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

export function inferKind(prompt: string): ConfidenceResult {
  const tokens = tokenize(prompt)
  const tokenSet = new Set(tokens)

  const scored = KINDS.map((k) => {
    let score = 0
    for (const hint of k.keywordHints) {
      if (tokenSet.has(hint)) {
        score += 2 // exact token match weighted higher
        continue
      }
      // substring match: any prompt token contains hint, or hint contains token
      for (const t of tokens) {
        if (t.includes(hint) || hint.includes(t)) {
          score += 1
          break
        }
      }
    }
    return { kind: k.kind, score }
  }).sort((a, b) => b.score - a.score)

  const top = scored[0]
  const second = scored[1]
  const topScore = top?.score ?? 0
  const secondScore = second?.score ?? 0

  const confidence =
    topScore === 0 && secondScore === 0
      ? 0
      : topScore / (topScore + secondScore)

  let top3: string[]
  if (topScore === 0 && secondScore === 0) {
    top3 = [...DEFAULT_TOP3]
  } else {
    top3 = scored.slice(0, 3).map((s) => s.kind)
    while (top3.length < 3) top3.push(DEFAULT_TOP3[top3.length] ?? 'marketing')
  }

  const kind = confidence === 0 ? 'marketing' : top.kind

  return { kind, confidence, top3 }
}

export function getDefaultFamily(kind: string): string {
  return KINDS.find((k) => k.kind === kind)?.defaultFamily ?? 'Marketing'
}
