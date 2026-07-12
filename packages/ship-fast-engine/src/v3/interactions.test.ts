import { describe, it, expect } from 'vitest'
import { getInteraction, INTERACTIONS } from './interactions'
import type { InteractionProfile } from './types'

describe('INTERACTIONS registry', () => {
  describe('getInteraction', () => {
    it('returns a profile for a known component', () => {
      const profile = getInteraction('RestaurantMenu')
      expect(profile).not.toBeNull()
      expect(profile?.profiles).toEqual(['collection', 'cart'])
    })

    it('returns null for an unknown component', () => {
      expect(getInteraction('NonExistentComponent')).toBeNull()
    })
  })

  describe('RestaurantMenu', () => {
    const profile = INTERACTIONS.RestaurantMenu

    it('has collection + cart profiles', () => {
      expect(profile.profiles).toEqual(['collection', 'cart'])
    })

    it('has correct dataKey', () => {
      expect(profile.dataKey).toBe('Restaurant')
    })

    it('has correct seedTable', () => {
      expect(profile.seedTable).toBe('menuItems')
    })

    it('has correct seedPath', () => {
      expect(profile.seedPath).toBe('categories.items')
    })

    it('has correct seedFields', () => {
      expect(profile.seedFields).toEqual([
        'name',
        'description',
        'price',
        'tag',
      ])
    })

    it('has correct cartTable', () => {
      expect(profile.cartTable).toBe('orderItems')
    })

    it('has correct cartKey', () => {
      expect(profile.cartKey).toBe('name')
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        listCollection: 'menuCatalog',
        syncCollection: 'syncMenuCatalog',
        orderSummary: 'restaurantOrder',
        addToOrder: 'addMenuItem',
        removeFromOrder: 'removeMenuItem',
        clearOrder: 'clearRestaurantOrder',
      })
    })
  })

  describe('RestaurantReservations', () => {
    const profile = INTERACTIONS.RestaurantReservations

    it('has submission profile', () => {
      expect(profile.profiles).toEqual(['submission'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        submissionSummary: 'restaurantExperience',
        submit: 'reserveTable',
      })
    })
  })

  describe('RestaurantHero / Gallery / Story', () => {
    it('RestaurantHero is NONE', () => {
      expectNoneProfile(INTERACTIONS.RestaurantHero)
    })

    it('RestaurantGallery is NONE', () => {
      expectNoneProfile(INTERACTIONS.RestaurantGallery)
    })

    it('RestaurantStory is NONE', () => {
      expectNoneProfile(INTERACTIONS.RestaurantStory)
    })
  })

  describe('EcommerceProducts', () => {
    const profile = INTERACTIONS.EcommerceProducts

    it('has collection + cart profiles', () => {
      expect(profile.profiles).toEqual(['collection', 'cart'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        listCollection: 'productCatalog',
        syncCollection: 'syncProductCatalog',
        orderSummary: 'cartSummary',
        addToOrder: 'addToCart',
        removeFromOrder: 'removeFromCart',
        clearOrder: 'clearCart',
      })
    })
  })

  describe('Catalog', () => {
    const profile = INTERACTIONS.Catalog

    it('has collection + cart profiles', () => {
      expect(profile.profiles).toEqual(['collection', 'cart'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        listCollection: 'productCatalog',
        syncCollection: 'syncProductCatalog',
        orderSummary: 'cartSummary',
        addToOrder: 'addToCart',
        removeFromOrder: 'removeFromCart',
        clearOrder: 'clearCart',
      })
    })
  })

  describe('EcommerceCheckout', () => {
    const profile = INTERACTIONS.EcommerceCheckout

    it('has submission profile', () => {
      expect(profile.profiles).toEqual(['submission'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        submissionSummary: 'orderExperience',
        submit: 'placeOrder',
      })
    })
  })

  describe('SaasContact', () => {
    const profile = INTERACTIONS.SaasContact

    it('has submission profile', () => {
      expect(profile.profiles).toEqual(['submission'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        submissionSummary: 'leadExperience',
        submit: 'captureLead',
      })
    })
  })

  describe('SaasDemo', () => {
    const profile = INTERACTIONS.SaasDemo

    it('has submission profile', () => {
      expect(profile.profiles).toEqual(['submission'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        submissionSummary: 'demoExperience',
        submit: 'requestDemo',
      })
    })
  })

  describe('ContactForm', () => {
    const profile = INTERACTIONS.ContactForm

    it('has submission profile', () => {
      expect(profile.profiles).toEqual(['submission'])
    })

    it('does not have a dataKey', () => {
      expect(profile.dataKey).toBeUndefined()
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        submissionSummary: 'contactExperience',
        submit: 'sendMessage',
      })
    })
  })

  describe('SearchBar', () => {
    const profile = INTERACTIONS.SearchBar

    it('has search profile', () => {
      expect(profile.profiles).toEqual(['search'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        searchState: 'searchState',
        setSearch: 'setSearch',
      })
    })
  })

  describe('AuthPanel', () => {
    const profile = INTERACTIONS.AuthPanel

    it('has auth profile', () => {
      expect(profile.profiles).toEqual(['auth'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        sessionSummary: 'sessionSummary',
        recordSession: 'recordSession',
        clearSessions: 'clearSessions',
      })
    })
  })

  describe('FavoritesButton', () => {
    const profile = INTERACTIONS.FavoritesButton

    it('has favorites profile', () => {
      expect(profile.profiles).toEqual(['favorites'])
    })

    it('has correct seedTable', () => {
      expect(profile.seedTable).toBe('savedItems')
    })

    it('has correct seedFields', () => {
      expect(profile.seedFields).toEqual(['name', 'description', 'price'])
    })

    it('has correct operations', () => {
      expect(profile.operations).toEqual({
        savedList: 'savedList',
        toggleSave: 'toggleSave',
      })
    })
  })

  describe('Universal no-interaction components', () => {
    it('Hero is NONE', () => {
      expectNoneProfile(INTERACTIONS.Hero)
    })

    it('Footer is NONE', () => {
      expectNoneProfile(INTERACTIONS.Footer)
    })

    it('Stats is NONE', () => {
      expectNoneProfile(INTERACTIONS.Stats)
    })

    it('Testimonials is NONE', () => {
      expectNoneProfile(INTERACTIONS.Testimonials)
    })

    it('Faq is NONE', () => {
      expectNoneProfile(INTERACTIONS.Faq)
    })

    it('Cta is NONE', () => {
      expectNoneProfile(INTERACTIONS.Cta)
    })
  })

  describe('invariants across all entries', () => {
    const interactiveComponents = [
      'RestaurantMenu',
      'RestaurantReservations',
      'EcommerceProducts',
      'EcommerceCheckout',
      'Catalog',
      'SaasContact',
      'SaasDemo',
      'ContactForm',
      'SearchBar',
      'AuthPanel',
      'FavoritesButton',
    ]

    const noneComponents = [
      'RestaurantHero',
      'RestaurantGallery',
      'RestaurantStory',
      'EcommerceHero',
      'EcommercePricing',
      'SaasPricing',
      'SaasHero',
      'SaasFeatures',
      'Hero',
      'Footer',
      'Stats',
      'Testimonials',
      'Faq',
      'Cta',
    ]

    it.each(interactiveComponents)(
      '%s has non-empty operations',
      (component) => {
        const profile = INTERACTIONS[component]
        expect(Object.keys(profile.operations).length).toBeGreaterThan(0)
      },
    )

    it.each(interactiveComponents)(
      '%s does not have "none" profile',
      (component) => {
        const profile = INTERACTIONS[component]
        expect(profile.profiles).not.toEqual(['none'])
      },
    )

    it.each(noneComponents)(
      '%s has profiles=["none"] and empty operations',
      (component) => {
        expectNoneProfile(INTERACTIONS[component])
      },
    )
  })
})

function expectNoneProfile(profile: InteractionProfile): void {
  expect(profile.profiles).toEqual(['none'])
  expect(profile.operations).toEqual({})
}
