// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const flushTailwindRuntime = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('public Tailwind browser runtime', () => {
  it('generates CSS for classes added after the runtime starts without CDN warning noise', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const source = readFileSync(
      join(process.cwd(), 'public/scripts/tailwind-browser.js'),
      'utf8',
    )

    window.eval(source)
    const element = document.createElement('div')
    element.className = 'bg-red-500 text-white'
    document.body.append(element)

    await flushTailwindRuntime()

    const generatedStyles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(generatedStyles).toContain('.bg-red-500')
    expect(generatedStyles).toContain('.text-white')
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringMatching(/cdn\.tailwindcss\.com.*production/i),
    )
    expect(error).not.toHaveBeenCalled()
  })
})
