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

  it('buffers @svelte blocks and finalizes them at flush', () => {
    const parser = new StreamingParser()
    parser.feed('marketing\nhero Test\n@svelte counter\n')
    parser.feed('<script>let count = 0</script>\n')
    parser.feed('<div>{count}</div>\n')
    parser.feed('@endsvelte\n')
    const plan = parser.flush()
    expect(plan.sections).toHaveLength(2)
    expect(plan.sections[1].role).toBe('counter')
    expect(plan.sections[1].svelte).toBeDefined()
    expect(plan.sections[1].svelte!.source).toContain('let count = 0')
    expect(plan.sections[1].svelte!.source).toContain('{count}')
  })

  it('flush processes a trailing partial line without newline', () => {
    const parser = new StreamingParser()
    parser.feed('restaurant\nhero A|B|C|D')
    const plan = parser.flush()
    expect(plan.sections).toHaveLength(1)
    expect(plan.sections[0].role).toBe('hero')
  })

  it('fires onMetadata for @brand, @title, @nav lines', () => {
    const parser = new StreamingParser()
    const metadata: Array<{ key: string; value: string }> = []
    parser.onMetadata((key, value) => metadata.push({ key, value }))
    parser.feed('marketing\n')
    parser.feed('@brand Acme Studio\n')
    parser.feed('@title Modern Marketing\n')
    parser.feed('@nav home:Home about:About contact:Contact\n')
    parser.feed('hero Welcome|Build faster\n')

    expect(parser.brand).toBe('Acme Studio')
    expect(parser.title).toBe('Modern Marketing')
    expect(parser.navLabels).toEqual({
      home: 'Home',
      about: 'About',
      contact: 'Contact',
    })
    expect(metadata).toContainEqual({ key: 'brand', value: 'Acme Studio' })
    expect(metadata).toContainEqual({ key: 'title', value: 'Modern Marketing' })
    expect(metadata).toContainEqual({ key: 'nav', value: 'home:Home' })
    expect(metadata).toContainEqual({ key: 'nav', value: 'about:About' })
    expect(metadata).toContainEqual({ key: 'nav', value: 'contact:Contact' })
  })

  it('exposes pages via getter as they stream', () => {
    const parser = new StreamingParser()
    parser.feed('marketing\n')
    parser.feed('@pages menu about contact\n')
    expect(parser.pages).toEqual(['menu', 'about', 'contact'])
  })

  it('partial feed + flush produces same plan as full feed', () => {
    const fullPlan = new StreamingParser()
    fullPlan.feed('restaurant\n@brand Test\nhero A|B|C\nfooter\n@pages menu\n')
    const fullResult = fullPlan.flush()

    const partialPlan = new StreamingParser()
    partialPlan.feed('restau')
    partialPlan.feed('rant\n')
    partialPlan.feed('@brand Test\n')
    partialPlan.feed('hero A|')
    partialPlan.feed('B|C\n')
    partialPlan.feed('footer\n')
    partialPlan.feed('@pages menu\n')
    const partialResult = partialPlan.flush()

    expect(partialResult.kind).toBe(fullResult.kind)
    expect(partialResult.sections).toHaveLength(fullResult.sections.length)
    expect(partialResult.pages).toEqual(fullResult.pages)
    expect(partialResult.sections[0].role).toBe(fullResult.sections[0].role)
    expect(partialResult.sections[0].content).toEqual(
      fullResult.sections[0].content,
    )
  })
})
