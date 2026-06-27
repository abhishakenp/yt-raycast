import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { propertyListingLakebed } from './property-listing-lakebed.ts'

describe('propertyListingLakebed', () => {
  it('stores shared property search state and history', async () => {
    const first = createLakebedHandlerContext({
      data: { inquiries: [], listings: [], saved: [], searches: [], state: [] },
      props: {},
      schema: propertyListingLakebed.schema,
      writable: true,
    })

    await propertyListingLakebed.mutations.setPropertySearch(first.context, {
      filter: 'For Rent',
      location: 'Midtown',
      query: '',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: propertyListingLakebed.schema,
    })
    const summary = propertyListingLakebed.queries.propertyListingState(
      second.context,
    )

    expect(summary).toMatchObject({
      filter: 'For Rent',
      location: 'Midtown',
      query: '',
      selectedAddress: '',
    })
    expect(summary.searches).toMatchObject([
      {
        filter: 'For Rent',
        location: 'Midtown',
        query: '',
      },
    ])
  })

  it('toggles saved listings and records selected listing state', async () => {
    const first = createLakebedHandlerContext({
      data: { inquiries: [], listings: [], saved: [], searches: [], state: [] },
      props: {},
      schema: propertyListingLakebed.schema,
      writable: true,
    })

    await propertyListingLakebed.mutations.saveListing(first.context, {
      address: '210 Birch St #5, Midtown',
      price: '$2,400/mo',
    })
    await propertyListingLakebed.mutations.selectListing(first.context, {
      address: '210 Birch St #5, Midtown',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: propertyListingLakebed.schema,
    })
    const summary = propertyListingLakebed.queries.propertyListingState(
      second.context,
    )

    expect(summary.savedCount).toBe(1)
    expect(summary.savedAddresses).toEqual(['210 Birch St #5, Midtown'])
    expect(summary.selectedAddress).toBe('210 Birch St #5, Midtown')
    expect(propertyListingLakebed.schema.inquiries.seedFromProps).toBe(false)
    expect(propertyListingLakebed.schema.listings.seedFromProps).not.toBe(false)
    expect(propertyListingLakebed.schema.saved.seedFromProps).toBe(false)
    expect(propertyListingLakebed.schema.searches.seedFromProps).toBe(false)
    expect(propertyListingLakebed.schema.state.seedFromProps).toBe(false)

    const third = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: propertyListingLakebed.schema,
      writable: true,
    })
    await propertyListingLakebed.mutations.saveListing(third.context, {
      address: '210 Birch St #5, Midtown',
      price: '$2,400/mo',
    })

    const fourth = createLakebedHandlerContext({
      data: third.getPatch(),
      props: {},
      schema: propertyListingLakebed.schema,
    })
    expect(
      propertyListingLakebed.queries.propertyListingState(fourth.context)
        .savedCount,
    ).toBe(0)
  })

  it('syncs a shared listing catalog and records inquiry actions', async () => {
    const first = createLakebedHandlerContext({
      data: { inquiries: [], listings: [], saved: [], searches: [], state: [] },
      props: {},
      schema: propertyListingLakebed.schema,
      writable: true,
    })

    await propertyListingLakebed.mutations.syncPropertyListings(first.context, {
      listings: [
        {
          address: '1207 Cedar Hollow, Lakeview',
          baths: '3',
          beds: '4',
          price: '$945,000',
          sqft: '2,310',
          tag: 'For Sale',
        },
      ],
    })
    await propertyListingLakebed.mutations.recordPropertyInquiry(
      first.context,
      {
        address: '1207 Cedar Hollow, Lakeview',
        intent: 'Contact agent',
        source: 'listing-card',
      },
    )

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: propertyListingLakebed.schema,
    })

    expect(
      propertyListingLakebed.queries.propertyCatalog(second.context),
    ).toMatchObject([
      {
        address: '1207 Cedar Hollow, Lakeview',
        baths: '3',
        beds: '4',
        price: '$945,000',
        sqft: '2,310',
        tag: 'For Sale',
      },
    ])
    expect(
      propertyListingLakebed.queries.propertyListingState(second.context),
    ).toMatchObject({
      inquiries: [
        {
          address: '1207 Cedar Hollow, Lakeview',
          intent: 'Contact agent',
          source: 'listing-card',
        },
      ],
      inquiryCount: 1,
    })
  })
})
