import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { buildSeedPatchFromProps } from '@ship-fast/lakebed/react'
import { inquiryLakebed } from './inquiry-lakebed.ts'

describe('inquiryLakebed', () => {
  it('stores normalized inquiries with structured form fields', async () => {
    const first = createLakebedHandlerContext({
      data: { actions: [], inquiries: [] },
      props: {},
      schema: inquiryLakebed.schema,
      writable: true,
    })

    await inquiryLakebed.mutations.submitInquiry(first.context, {
      fields: {
        email: ' Lead@Example.COM ',
        eventType: 'Wedding',
        firstName: 'Ada',
        lastName: 'Lovelace',
        vision: 'A garden reception with live music.',
      },
      source: 'Event planner inquiry',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: inquiryLakebed.schema,
    })
    const summary = inquiryLakebed.queries.inquirySummary(second.context)

    expect(summary.count).toBe(1)
    expect(summary.latest).toMatchObject({
      email: 'lead@example.com',
      message: 'A garden reception with live music.',
      name: 'Ada',
      source: 'Event planner inquiry',
      subject: 'Wedding',
    })
    expect(summary.latest?.fieldsJson).toBe(
      JSON.stringify({
        email: ' Lead@Example.COM ',
        eventType: 'Wedding',
        firstName: 'Ada',
        lastName: 'Lovelace',
        vision: 'A garden reception with live music.',
      }),
    )
  })

  it('stores scoped contact actions separately from inquiry submissions', async () => {
    const first = createLakebedHandlerContext({
      data: { actions: [], inquiries: [] },
      props: {},
      schema: inquiryLakebed.schema,
      writable: true,
    })

    await inquiryLakebed.mutations.recordContactAction(first.context, {
      kind: 'cta',
      label: ' Talk to sales ',
      source: 'navbar',
      target: 'Contact form',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: inquiryLakebed.schema,
    })
    const summary = inquiryLakebed.queries.actionSummary(second.context)
    const inquirySummary = inquiryLakebed.queries.inquirySummary(second.context)

    expect(summary.count).toBe(1)
    expect(summary.latest).toMatchObject({
      kind: 'cta',
      label: 'Talk to sales',
      source: 'navbar',
      target: 'Contact form',
    })
    expect(inquirySummary.count).toBe(0)
  })

  it('does not seed inquiry rows from generated props', () => {
    const patch = buildSeedPatchFromProps({
      data: { actions: [], inquiries: [] },
      definition: inquiryLakebed,
      props: {
        actions: [{ label: 'Seeded action' }],
        inquiries: [{ email: 'seed@example.com', source: 'Props' }],
      },
    })

    expect(patch).toEqual({})
  })
})
