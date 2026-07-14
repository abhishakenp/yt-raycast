import { describe, expect, it } from 'vitest'

import {
  createLakebedDefinition,
  createLakebedHandlerContext,
  number,
  string,
  table,
} from './server.ts'

const metricDefinition = createLakebedDefinition({
  metrics: table({
    label: string().default('untitled'),
    value: number().default(0),
  }),
})

function createRuntime() {
  return createLakebedHandlerContext({
    data: {
      metrics: [
        {
          createdAt: '2026-01-01T00:00:00.000Z',
          id: 'metric-1',
          label: 'Existing',
          updatedAt: '2026-01-01T00:00:00.000Z',
          value: 1,
        },
        {
          createdAt: '2026-01-02T00:00:00.000Z',
          id: 'metric-2',
          label: 'Second',
          updatedAt: '2026-01-02T00:00:00.000Z',
          value: 2,
        },
      ],
    },
    props: {},
    schema: metricDefinition.schema,
    writable: true,
  })
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

describe('Lakebed object database validation', () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects a non-finite numeric field: %s',
    function rejectsNonFinite(value) {
      const { context } = createRuntime()

      expect(() =>
        context.db.metrics.insert({ label: 'Invalid', value }),
      ).toThrow(/finite number/i)
    },
  )

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an invalid query limit: %s',
    function rejectsInvalidLimit(limit) {
      const { context } = createRuntime()

      expect(() => context.db.metrics.limit(limit).all()).toThrow(
        /non-negative integer/i,
      )
    },
  )

  it('rejects explicit null instead of silently applying a field default', () => {
    const { context } = createRuntime()
    const insert = context.db.metrics.insert
    if (!isFunction(insert)) throw new Error('Metric insert function missing')

    expect(() =>
      Reflect.apply(insert, context.db.metrics, [{ label: null, value: 3 }]),
    ).toThrow(/metrics\.label.*string/i)
  })

  it('does not emit a synchronized patch for an empty update', () => {
    const { context, getPatch } = createRuntime()

    context.db.metrics.update('metric-1', {})

    expect(getPatch()).toEqual({})
  })

  it('accepts finite numbers and non-negative integer limits as a control', () => {
    const { context } = createRuntime()

    context.db.metrics.insert({ label: 'Valid', value: 3.5 })

    expect(context.db.metrics.orderBy('value').limit(2).all()).toHaveLength(2)
  })
})
