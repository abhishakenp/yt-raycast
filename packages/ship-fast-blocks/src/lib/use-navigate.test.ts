import { describe, expect, it } from 'vitest'

import { parseRouteTarget, resolveRouteTarget } from './use-navigate.tsx'

describe('route target resolution', () => {
  it('parses page and section targets', () => {
    expect(parseRouteTarget('Pricing')).toEqual({
      page: 'Pricing',
      type: 'page',
    })
    expect(parseRouteTarget('Pricing#pricing_faq')).toEqual({
      page: 'Pricing',
      sectionId: 'pricing_faq',
      type: 'section',
    })
    expect(parseRouteTarget('#home_features')).toEqual({
      page: '',
      sectionId: 'home_features',
      type: 'section',
    })
    expect(parseRouteTarget('')).toBeNull()
  })

  it('resolves exact routes and explicit target aliases', () => {
    const routes = ['Home', 'Pricing']
    const targetMap = {
      'Get Started': 'Pricing#pricing_pricing',
      'get started': 'Pricing#pricing_pricing',
    }

    expect(resolveRouteTarget('Pricing', routes, targetMap)).toEqual({
      page: 'Pricing',
      type: 'page',
    })
    expect(resolveRouteTarget('Get Started', routes, targetMap)).toEqual({
      page: 'Pricing',
      sectionId: 'pricing_pricing',
      type: 'section',
    })
  })

  it('maps semantic CTA labels to meaningful page or section targets', () => {
    const routes = ['Home', 'Plans', 'Contact']
    const targetMap = {
      'Book demo': 'Contact#contact_form',
      subscribe: 'Plans#plans_pricing',
    }

    expect(resolveRouteTarget('Upgrade now', routes, targetMap)).toEqual({
      page: 'Plans',
      type: 'page',
    })
    expect(resolveRouteTarget('Book demo', routes, targetMap)).toEqual({
      page: 'Contact',
      sectionId: 'contact_form',
      type: 'section',
    })
  })

  it('resolves generated bespoke role labels through the shared semantic vocabulary', () => {
    const routes = [
      'Home',
      'Lookbook',
      'Programs',
      'Booking',
      'Speakers',
      'Amenities',
    ]
    const targetMap = {
      lookbook: 'Lookbook#lookbook_lookbook',
      programs: 'Programs#programs_programs',
      booking: 'Booking#booking_booking',
      speakers: 'Speakers#speakers_speakers',
      amenities: 'Amenities#amenities_amenities',
    }

    expect(resolveRouteTarget('Explore Full Lookbook', routes, targetMap)).toEqual(
      {
        page: 'Lookbook',
        type: 'page',
      },
    )
    expect(resolveRouteTarget('Explore program', routes, targetMap)).toEqual({
      page: 'Programs',
      type: 'page',
    })
    expect(resolveRouteTarget('Book a room', routes, targetMap)).toEqual({
      page: 'Booking',
      type: 'page',
    })
    expect(resolveRouteTarget('Meet speakers', routes, targetMap)).toEqual({
      page: 'Speakers',
      type: 'page',
    })
    expect(resolveRouteTarget('View amenities', routes, targetMap)).toEqual({
      page: 'Amenities',
      type: 'page',
    })
  })

  it('does not fall back unresolved targets to Home', () => {
    expect(resolveRouteTarget('Definitely missing', ['Home'], {})).toBeNull()
  })

  it('keeps commerce mutations out of navigation resolution', () => {
    expect(
      resolveRouteTarget('Add Hydrating Serum to cart', ['Home'], {}),
    ).toBe(null)
  })
})
