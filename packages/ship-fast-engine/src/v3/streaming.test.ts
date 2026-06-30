import { describe, it, expect } from 'vitest'
import { StreamingParser } from './streaming'

describe('StreamingParser', () => {
  it('feeds chunks across line boundaries and fires callbacks', () => {
    const parser = new StreamingParser()
    const starts: string[] = []
    const completes: string[] = []
    parser.onSectionStart((role) => starts.push(role))
    parser.onSectionComplete((s) => completes.push(s.role))

    // Split the kind line and a section line across chunks.
    parser.feed('restau')
    parser.feed('rant\n')
    parser.feed('hero Farm to Table|Wood-fired cuisine|Rustic room\n')
    parser.feed('footer\n')

    expect(starts).toEqual(['hero', 'footer'])
    expect(completes).toEqual(['hero', 'footer'])
  })

  it('emits onSectionStart before onSectionComplete', () => {
    const parser = new StreamingParser()
    const order: string[] = []
    parser.onSectionStart(() => order.push('start'))
    parser.onSectionComplete(() => order.push('complete'))
    parser.feed('restaurant\nhero A|B|C\n')
    expect(order).toEqual(['start', 'complete'])
  })

  it('flush returns the full plan', () => {
    const parser = new StreamingParser()
    parser.feed('restaurant\nhero A|B|C|D\nfooter\n@pages menu\n')
    const plan = parser.flush()
    expect(plan.kind).toBe('restaurant')
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[0].role).toBe('hero')
    expect(plan.pages).toEqual(['menu'])
  })

  it('holds a partial line in the buffer until a newline arrives', () => {
    const parser = new StreamingParser()
    const starts: string[] = []
    parser.onSectionStart((r) => starts.push(r))
    parser.feed('restaurant\n')
    parser.feed('hero Partial') // no newline yet
    expect(starts).toEqual([])
    parser.feed(' Heading|Sub\n') // completes the line
    expect(starts).toEqual(['hero'])
    const plan = parser.flush()
    expect(plan.sections[0].content).toEqual(['Partial Heading', 'Sub'])
  })

  it('buffers + lines and applies them at flush', () => {
    const parser = new StreamingParser()
    parser.feed('healthcare\nfooter\n+ pets name species +\n')
    const plan = parser.flush()
    expect(plan.tables).toHaveLength(1)
    expect(plan.tables[0]).toEqual({
      name: 'pets',
      fields: ['name', 'species'],
      seeded: true,
    })
  })

  it('flush processes a trailing partial line without newline', () => {
    const parser = new StreamingParser()
    parser.feed('restaurant\nhero A|B|C|D')
    const plan = parser.flush()
    expect(plan.sections).toHaveLength(1)
    expect(plan.sections[0].role).toBe('hero')
  })
})
