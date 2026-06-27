import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { jobBoardLakebed } from './job-board-lakebed.ts'

describe('jobBoardLakebed', () => {
  it('stores shared search state and history', async () => {
    const first = createLakebedHandlerContext({
      data: { applications: [], searches: [], state: [] },
      props: {},
      schema: jobBoardLakebed.schema,
      writable: true,
    })

    await jobBoardLakebed.mutations.setJobSearch(first.context, {
      filter: 'Remote',
      location: 'Remote',
      query: 'Frontend',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: jobBoardLakebed.schema,
    })
    const summary = jobBoardLakebed.queries.jobBoardState(second.context)

    expect(summary).toMatchObject({
      filter: 'Remote',
      location: 'Remote',
      query: 'Frontend',
      visibleCount: 3,
    })
    expect(summary.searches).toMatchObject([
      {
        filter: 'Remote',
        location: 'Remote',
        query: 'Frontend',
      },
    ])
  })

  it('records applications once and increases visible job count', async () => {
    const context = createLakebedHandlerContext({
      data: { applications: [], searches: [], state: [] },
      props: {},
      schema: jobBoardLakebed.schema,
      writable: true,
    })

    await jobBoardLakebed.mutations.applyToJob(context.context, {
      company: 'Acme — Remote',
      role: 'Frontend Engineer',
    })
    await jobBoardLakebed.mutations.applyToJob(context.context, {
      company: 'Acme — Remote',
      role: 'Frontend Engineer',
    })
    await jobBoardLakebed.mutations.loadMoreJobs(context.context, 3)

    const summaryContext = createLakebedHandlerContext({
      data: context.getPatch(),
      props: {},
      schema: jobBoardLakebed.schema,
    })
    const summary = jobBoardLakebed.queries.jobBoardState(
      summaryContext.context,
    )

    expect(summary.applicationCount).toBe(1)
    expect(summary.applications).toMatchObject([
      {
        company: 'Acme — Remote',
        role: 'Frontend Engineer',
      },
    ])
    expect(summary.visibleCount).toBe(6)
  })

  it('does not seed interaction state from generated props', () => {
    expect(jobBoardLakebed.schema.applications.seedFromProps).toBe(false)
    expect(jobBoardLakebed.schema.searches.seedFromProps).toBe(false)
    expect(jobBoardLakebed.schema.state.seedFromProps).toBe(false)
  })
})
