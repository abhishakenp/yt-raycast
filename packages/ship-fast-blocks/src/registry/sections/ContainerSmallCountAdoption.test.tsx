// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@ship-fast/lakebed/react', () => {
  const mutation = Object.assign(
    vi.fn(async () => []),
    {
      isPending: false,
      lastError: null,
      pendingCount: 0,
      reset: vi.fn(),
    },
  )

  const auth = () => ({
    displayName: 'Guest',
    isAuthenticated: false,
    isGuest: true,
    provider: 'guest',
    user: {
      displayName: 'Guest',
      id: 'guest:local',
      isGuest: true,
      provider: 'guest',
      userId: 'guest:local',
    },
    userId: 'guest:local',
  })

  return {
    createLakebedClient: vi.fn(() => ({
      signInWithGoogle: vi.fn(async () => ({
        bundle: { challenge: '', state: '', verifier: '' },
        url: '',
      })),
      signOut: vi.fn(),
      useAuth: auth,
      useData: () => ({}),
      useMutation: () => mutation,
      useQuery: () => null,
    })),
    useAuth: auth,
  }
})

const { cleanup, render } = await import('@testing-library/react')
const { AiProductFeatures } = await import('./ai-product/AiProductFeatures.tsx')
const { AiProductGallery } = await import('./ai-product/AiProductGallery.tsx')
const { AiProductSteps } = await import('./ai-product/AiProductSteps.tsx')
const { FaqContactCta } = await import('./faq/FaqContactCta.tsx')
const { FaqFooter } = await import('./faq/FaqFooter.tsx')
const { FaqNavbar } = await import('./faq/FaqNavbar.tsx')
const { FaqTopics } = await import('./faq/FaqTopics.tsx')
const { GovPortalLeadership } =
  await import('./gov-portal/GovPortalCompany.tsx')
const { GovPortalQuickLinks, GovPortalStats } =
  await import('./gov-portal/GovPortalHome.tsx')
const { GovPortalMedia, GovPortalNewsEvents } =
  await import('./gov-portal/GovPortalInfo.tsx')
const { GovPortalTenderBoard } =
  await import('./gov-portal/GovPortalTenders.tsx')
const { KnowledgeBaseCategories } =
  await import('./knowledge-base/KnowledgeBaseCategories.tsx')
const { KnowledgeBaseGuides } =
  await import('./knowledge-base/KnowledgeBaseGuides.tsx')
const { KnowledgeBasePopular } =
  await import('./knowledge-base/KnowledgeBasePopular.tsx')
const { KnowledgeBaseStats } =
  await import('./knowledge-base/KnowledgeBaseStats.tsx')
const { NewsAuthors } = await import('./news/NewsAuthors.tsx')
const { NewsFeaturedStory } = await import('./news/NewsFeaturedStory.tsx')
const { NewsStoryGrid } = await import('./news/NewsStoryGrid.tsx')
const { NewsTopics } = await import('./news/NewsTopics.tsx')
const { NonprofitLogos } = await import('./nonprofit/NonprofitLogos.tsx')
const { NonprofitServices } = await import('./nonprofit/NonprofitServices.tsx')
const { NonprofitTestimonials } =
  await import('./nonprofit/NonprofitTestimonials.tsx')

const smallCountSections = [
  AiProductFeatures,
  AiProductGallery,
  AiProductSteps,
  FaqContactCta,
  FaqFooter,
  FaqNavbar,
  FaqTopics,
  GovPortalLeadership,
  GovPortalMedia,
  GovPortalNewsEvents,
  GovPortalQuickLinks,
  GovPortalStats,
  GovPortalTenderBoard,
  KnowledgeBaseCategories,
  KnowledgeBaseGuides,
  KnowledgeBasePopular,
  KnowledgeBaseStats,
  NewsAuthors,
  NewsFeaturedStory,
  NewsStoryGrid,
  NewsTopics,
  NonprofitLogos,
  NonprofitServices,
  NonprofitTestimonials,
]

afterEach(() => {
  cleanup()
})

describe('small-count Container adoption', () => {
  it.each(smallCountSections)(
    'renders %s with the shared Container slot',
    (section) => {
      const SectionProbe = () =>
        section.client.component({
          props: {},
          statementId: `${section.client.name}_test`,
        })

      const { container } = render(<SectionProbe />)

      const wrapper = container.querySelector(
        '[data-slot="container"], [data-slot="footer-content"]',
      )

      if (!wrapper) {
        expect(
          container.querySelector(
            '[data-slot="logo-strip"], [data-slot="cta-band"]',
          ),
          section.client.name,
        ).not.toBeNull()
        return
      }

      expect(wrapper, section.client.name).not.toBeNull()
      expect(wrapper?.className, section.client.name).toContain('mx-auto')
      expect(wrapper?.className, section.client.name).toContain('max-w-7xl')
      expect(wrapper?.className, section.client.name).toMatch(/px-[46]/)
      expect(wrapper?.className, section.client.name).toContain('lg:px-8')
    },
  )
})
