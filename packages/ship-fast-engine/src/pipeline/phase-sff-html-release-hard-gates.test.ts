import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { writeSffHtmlHome } from './phase-sff-html'

type GenerateInput = {
  system: string
  user: string
  onToken?: (token: string, accumulated: string) => void
}

const VALID_HTML =
  '<!doctype html><html lang="en"><head><title>Release</title></head><body><main><h1>Release</h1></main></body></html>'

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-sff-release-'))
}

function sourceText(event: unknown): string | undefined {
  if (!event || typeof event !== 'object') return undefined
  if (Reflect.get(event, 'type') !== 'source') return undefined
  const text = Reflect.get(event, 'text')
  return typeof text === 'string' ? text : undefined
}

async function deterministicGenerator() {
  return { content: VALID_HTML, cost: 0.005 }
}

describe('SFF HTML generation failure hard gates', () => {
  it('retries a transient malformed model response before failing the phase', async () => {
    let attempts = 0

    async function transientMalformedGenerator() {
      attempts += 1
      if (attempts === 1) {
        return { content: '<!doctype html><html><body>partial' }
      }
      return { content: VALID_HTML, cost: 0.005 }
    }

    const target = workspace()
    await expect(
      writeSffHtmlHome({
        workspace: target,
        prompt: 'A reliable release page',
        generateHtml: transientMalformedGenerator,
      }),
    ).resolves.toMatchObject({ chars: VALID_HTML.length })

    expect(attempts).toBe(2)
    expect(readFileSync(join(target, 'index.html'), 'utf8')).toBe(VALID_HTML)
  })

  it('rolls back partial streamed output when the model disconnects', async () => {
    const broadcasts: unknown[] = []
    const target = workspace()

    async function disconnectAfterPartial(
      input: GenerateInput,
    ): Promise<{ content: string }> {
      input.onToken?.('<!doctype html>', '<!doctype html><html><body>partial')
      throw new Error('model stream disconnected')
    }

    await expect(
      writeSffHtmlHome({
        workspace: target,
        prompt: 'A reliable release page',
        generateHtml: disconnectAfterPartial,
        sessionCtx: {
          broadcast(payload: unknown) {
            broadcasts.push(payload)
          },
        },
      }),
    ).rejects.toThrow('model stream disconnected')

    expect(existsSync(join(target, 'index.html'))).toBe(false)
    expect(existsSync(join(target, 'home.openui'))).toBe(false)
    expect(broadcasts.map(sourceText).filter(Boolean)).toHaveLength(0)
  })

  it('never broadcasts unsanitized streamed scripts to the preview', async () => {
    const broadcasts: unknown[] = []
    const unsafeHtml = VALID_HTML.replace(
      '</body>',
      '<script>window.releaseSecret="exposed"</script></body>',
    )

    async function unsafeStream(input: GenerateInput) {
      input.onToken?.(unsafeHtml, unsafeHtml)
      return { content: unsafeHtml }
    }

    const target = workspace()
    await writeSffHtmlHome({
      workspace: target,
      prompt: 'A reliable release page',
      generateHtml: unsafeStream,
      sessionCtx: {
        broadcast(payload: unknown) {
          broadcasts.push(payload)
        },
      },
    })

    expect(readFileSync(join(target, 'index.html'), 'utf8')).not.toContain(
      'releaseSecret',
    )
    expect(JSON.stringify(broadcasts)).not.toContain('releaseSecret')
  })

  it('writes byte-identical artifacts for the same resolved model output', async () => {
    const first = workspace()
    const second = workspace()

    await writeSffHtmlHome({
      workspace: first,
      prompt: 'A reliable release page',
      preferredLanguage: 'en',
      generateHtml: deterministicGenerator,
    })
    await writeSffHtmlHome({
      workspace: second,
      prompt: 'A reliable release page',
      preferredLanguage: 'en',
      generateHtml: deterministicGenerator,
    })

    expect(readFileSync(join(first, 'index.html'))).toEqual(
      readFileSync(join(second, 'index.html')),
    )
    expect(readFileSync(join(first, 'home.openui'))).toEqual(
      readFileSync(join(second, 'home.openui')),
    )
  })
})
