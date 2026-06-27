import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const htmlFixture = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head>
<body><main><h1>Dog Journal</h1></main></body>
</html>`

const groqMock = vi.hoisted(() => vi.fn())
const groqStreamMock = vi.hoisted(() =>
  vi.fn(
    async (
      _user: string,
      options: { onToken?: (token: string, accumulated: string) => void },
    ) => {
      options.onToken?.(htmlFixture, htmlFixture)
      return { content: htmlFixture, cost: 0.001 }
    },
  ),
)
const enrichBrandProfileMock = vi.hoisted(() =>
  vi.fn(async () => ({
    verified: true,
    requestedName: 'Dog Journal',
    officialName: 'Dog Journal',
    logoUrl: 'https://cdn.brandfetch.io/dog-journal/logo.svg',
  })),
)
const resolvePexelsImageHintsMock = vi.hoisted(() =>
  vi.fn(
    async (
      _input: unknown,
      options?: { onProgress?: (partial: unknown) => void },
    ) => {
      options?.onProgress?.({ photos: 1 })
      return {
        photos: [
          {
            query: 'dogs editorial',
            alt: 'Dog resting by a magazine',
            url: 'https://images.pexels.com/photos/456/pexels-photo-456.jpeg',
          },
        ],
      }
    },
  ),
)

vi.mock('../llm/groq.js', () => ({
  groq: groqMock,
  groqStream: groqStreamMock,
}))
vi.mock('./brand-profile.js', () => ({
  enrichBrandProfile: enrichBrandProfileMock,
}))
vi.mock('./image-hints.js', () => ({
  resolvePexelsImageHints: resolvePexelsImageHintsMock,
}))

describe('runAllV2', () => {
  it('generates a single-pass SFF HTML homepage', async () => {
    const { runAllV2 } = await import('./runner-v2.ts')
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-run-v2-'))

    await runAllV2({
      workspace,
      prompt: 'a blog about dogs',
      preferredLanguage: 'en',
      sessionCtx: {
        broadcast: vi.fn(),
        setPrompt: vi.fn(),
        setTasks: vi.fn(),
        updateTask: vi.fn(),
        signalHomepageReady: vi.fn(),
        signalOpenuiReady: vi.fn(),
        setElapsed: vi.fn(),
        setCost: vi.fn(),
      },
      integrations: undefined,
    })

    const tasks = JSON.parse(
      readFileSync(join(workspace, 'tasks.json'), 'utf8'),
    )

    expect(groqMock).not.toHaveBeenCalled()
    expect(groqStreamMock).toHaveBeenCalledTimes(1)
    expect(enrichBrandProfileMock).toHaveBeenCalledWith(
      expect.stringContaining('a blog about dogs'),
      workspace,
      expect.any(Function),
    )
    expect(resolvePexelsImageHintsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('a blog about dogs'),
        hydrationPrompt: expect.stringContaining('a blog about dogs'),
      }),
      expect.objectContaining({ onProgress: expect.any(Function) }),
    )
    expect(groqStreamMock.mock.calls[0]?.[0]).toContain('Verified Pexels media')
    expect(groqStreamMock.mock.calls[0]?.[0]).toContain(
      'https://images.pexels.com/photos/456/pexels-photo-456.jpeg',
    )
    expect(groqStreamMock.mock.calls[0]?.[0]).toContain(
      'VERIFIED BRAND PROFILE',
    )
    expect(groqStreamMock.mock.calls[0]?.[0]).toContain(
      'https://cdn.brandfetch.io/dog-journal/logo.svg',
    )
    expect(readFileSync(join(workspace, 'index.html'), 'utf8')).toBe(
      htmlFixture,
    )
    expect(tasks.tasks.map((task: { status: string }) => task.status)).toEqual([
      'DONE',
    ])
  }, 15_000)
})
