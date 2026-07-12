import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runTargetedEdits } from './targeted-edit-pass'

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
}))

vi.mock('@ship-fast/engine', () => ({
  generateText: mocks.generateText,
}))

vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'mock-model',
}))

function editArgs(mutation: ReturnType<typeof vi.fn>) {
  return mutation.mock.calls.map(([, args]) => args)
}

const HOME_HTML =
  '<html><head><title>Original Brand</title></head><body>' +
  '<h1>Original Brand</h1><h2>Sub Heading</h2><h3>Third Level</h3>' +
  '<button class="cta">Buy now</button>' +
  '<a class="btn" href="/x">Learn more</a>' +
  '<header><a class="logo">Logo Text</a></header>' +
  '<img alt="Hero Image" />' +
  '<p>Same</p></body></html>'

describe('runTargetedEdits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.generateText.mockResolvedValue('[]')
  })

  it('is a no-op when the brief is blank', async () => {
    const mutation = vi.fn().mockResolvedValue(null)

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: '   ',
      homeHtml: HOME_HTML,
    })

    expect(mocks.generateText).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('is a no-op when no candidates can be extracted from the html', async () => {
    const mutation = vi.fn().mockResolvedValue(null)

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename brand',
      homeHtml: '<html><body><div></div></body></html>',
    })

    expect(mocks.generateText).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('passes extracted candidates and the brief to the model', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValue('[]')

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'Rename the brand',
      homeHtml: HOME_HTML,
    })

    expect(mocks.generateText).toHaveBeenCalledTimes(1)
    const [, system, user] = mocks.generateText.mock.calls[0]!
    expect(system).toContain('brand names')
    expect(user).toContain('Brief:\nRename the brand')
    expect(user).toContain('Original Brand')
    expect(user).toContain('Buy now')
    expect(user).toContain('Logo Text')
  })

  it('applies valid text edits and skips ops whose before is not on the page', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValue(
      JSON.stringify([
        { before: 'Original Brand', after: 'New Brand' },
        { before: 'Buy now', after: 'Start today' },
        { before: 'Missing copy', after: 'Ignored' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      anonymousOwnerSecret: 'secret',
      brief: 'Rename brand and CTA',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(2)
    expect(editArgs(mutation)).toEqual([
      expect.objectContaining({
        editType: 'text',
        beforeText: 'Original Brand',
        afterText: 'New Brand',
        anonymousOwnerSecret: 'secret',
      }),
      expect.objectContaining({
        editType: 'text',
        beforeText: 'Buy now',
        afterText: 'Start today',
      }),
    ])
  })

  it('parses replace ops from a fenced json code block', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValue(
      [
        '```json',
        '[{"before":"Original Brand","after":"New Brand"}]',
        '```',
      ].join('\n'),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(1)
    expect(editArgs(mutation)[0]).toMatchObject({
      beforeText: 'Original Brand',
      afterText: 'New Brand',
    })
  })

  it('deduplicates ops with the same before string', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValue(
      JSON.stringify([
        { before: 'Original Brand', after: 'New Brand' },
        { before: 'Original Brand', after: 'Duplicate ignored' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(1)
    expect(editArgs(mutation)[0]).toMatchObject({ afterText: 'New Brand' })
  })

  it('skips no-op edits where before equals after', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValue(
      JSON.stringify([
        { before: 'Same', after: 'Same' },
        { before: 'Buy now', after: 'Start today' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(1)
    expect(editArgs(mutation)[0]).toMatchObject({ beforeText: 'Buy now' })
  })

  it('caps the number of applied ops at the MAX_OPS limit', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    // Build 20 valid ops whose `before` substrings all exist in homeHtml.
    const ops = Array.from({ length: 20 }, (_, i) => ({
      before: 'Original Brand',
      after: `New Brand ${i}`,
    }))
    // Only the first op survives dedup, so use distinct before substrings.
    const distinct = Array.from({ length: 20 }, (_, i) => ({
      before: `Original Brand${i}`,
      after: `New Brand ${i}`,
    }))
    // Inject distinct before substrings into the home html.
    const html =
      '<html><body>' +
      distinct.map((op) => `<p>${op.before}</p>`).join('') +
      '</body></html>'
    mocks.generateText.mockResolvedValue(JSON.stringify([...ops, ...distinct]))

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename many',
      homeHtml: html,
    })

    // MAX_OPS = 12; the parser caps at 12 ops, so at most 12 edits apply.
    expect(mutation.mock.calls.length).toBeLessThanOrEqual(12)
  })

  it('treats a model generation failure as a no-op (no mutation, no throw)', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mocks.generateText.mockRejectedValueOnce(new Error('model down'))

    await expect(
      runTargetedEdits({
        client: { mutation },
        sessionId: 's1',
        brief: 'rename',
        homeHtml: HOME_HTML,
      }),
    ).resolves.toBeUndefined()

    expect(mutation).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      '[clone] targeted-edit generation failed for s1:',
      'model down',
    )
    warn.mockRestore()
  })

  it('continues applying later edits when one mutation throws', async () => {
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('first failed'))
      .mockResolvedValueOnce(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mocks.generateText.mockResolvedValueOnce(
      JSON.stringify([
        { before: 'Original Brand', after: 'New Brand' },
        { before: 'Buy now', after: 'Start today' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledWith(
      '[clone] targeted-edit apply failed for s1:',
      'first failed',
    )
    warn.mockRestore()
  })

  it('does not apply edits when the model returns malformed JSON', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValueOnce('not json at all')

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).not.toHaveBeenCalled()
  })

  it('does not apply edits when the model returns a non-array JSON value', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValueOnce('{"before":"x","after":"y"}')

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).not.toHaveBeenCalled()
  })

  it('filters out ops with non-string before/after fields', async () => {
    const mutation = vi.fn().mockResolvedValue(null)
    mocks.generateText.mockResolvedValueOnce(
      JSON.stringify([
        { before: 'Original Brand', after: 'New Brand' },
        { before: 123, after: 'numeric before' },
        { before: 'Buy now', after: null },
        { before: '   ', after: 'blank before' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 's1',
      brief: 'rename',
      homeHtml: HOME_HTML,
    })

    expect(mutation).toHaveBeenCalledTimes(1)
    expect(editArgs(mutation)[0]).toMatchObject({
      beforeText: 'Original Brand',
      afterText: 'New Brand',
    })
  })
})
