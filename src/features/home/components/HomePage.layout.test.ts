import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readHomePageSource = (): string =>
  readFileSync(
    join(process.cwd(), 'src/features/home/components/HomePage.tsx'),
    'utf8',
  )

describe('HomePage layout', () => {
  it('keeps the gallery close to the prompt form without viewport-height hero spacing', () => {
    const source = readHomePageSource()

    expect(source).toContain('className="mb-10 mt-4 min-h-[280px]')
    expect(source).toContain('className="relative grid min-h-0 w-full')
    expect(source).toContain('pb-[clamp(18px,2vw,28px)]')
    expect(source).toContain('className="relative z-[1] flex min-h-0 w-full')
    expect(source).not.toContain('min-h-[70svh]')
    expect(source).not.toContain('max-[1100px]:min-h-[720px]')
    expect(source).not.toContain('max-[760px]:min-h-[600px]')
    expect(source).not.toContain('delete-generations-key')
  })
})
