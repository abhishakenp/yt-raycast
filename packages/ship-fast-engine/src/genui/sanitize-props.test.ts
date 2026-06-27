import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'

import { sanitizeProps } from '../../../ship-fast-blocks/src/capsules/sanitize-props.ts'

const schema = z.object({
  title: z.string().optional(),
  count: z.number().optional(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        blocks: z.array(z.object({ p: z.string().optional() })),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
})

describe('sanitizeProps', () => {
  it('repairs array items whose required nested array is null or missing', () => {
    const result = sanitizeProps(
      {
        title: 'Hello',
        sections: [
          { heading: 'Good', blocks: [{ p: 'ok' }] },
          { heading: 'NullBlocks', blocks: null },
          { heading: 'MissingBlocks' },
        ],
      },
      schema,
    ) as { sections: Array<{ blocks: unknown[]; heading: string }> }

    expect(result.sections).toHaveLength(3)
    expect(result.sections[0].heading).toBe('Good')
    expect(result.sections[1]).toMatchObject({
      blocks: [],
      heading: 'NullBlocks',
    })
    expect(result.sections[2]).toMatchObject({
      blocks: [],
      heading: 'MissingBlocks',
    })
  })

  it('coerces scalar types instead of discarding content', () => {
    const result = sanitizeProps({ title: 42, count: '7' }, schema) as {
      title: unknown
      count: unknown
    }
    expect(result.title).toBe('42')
    expect(result.count).toBe(7)
  })

  it('drops null arrays on optional fields so component defaults apply', () => {
    const result = sanitizeProps({ tags: null }, schema) as {
      tags?: unknown
    }
    expect('tags' in result).toBe(false)
  })

  it('filters non-string entries out of a string array', () => {
    const result = sanitizeProps({ tags: ['a', null, 5, 'b'] }, schema) as {
      tags: unknown[]
    }
    expect(result.tags).toEqual(['a', '5', 'b'])
  })

  it('never throws and returns the original props on unexpected input', () => {
    expect(sanitizeProps(null as never, schema)).toBeNull()
    expect(sanitizeProps('x' as never, schema)).toBe('x')
  })
})
