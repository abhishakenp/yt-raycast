import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readRootSource = () =>
  readFileSync(join(process.cwd(), 'src/routes/__root.tsx'), 'utf8')

describe('root document hydration hardening', () => {
  it('suppresses extension-added attribute mismatches on document elements', () => {
    const source = readRootSource()
    const htmlBlock = source.slice(source.indexOf('<html'), source.indexOf('<head>'))
    const bodyBlock = source.slice(source.indexOf('<body'), source.indexOf('{children}'))

    expect(htmlBlock).toContain('suppressHydrationWarning')
    expect(bodyBlock).toContain('suppressHydrationWarning')
  })

  it('configures an app-owned not found component', () => {
    const source = readRootSource()

    expect(source).toContain('const NotFoundComponent = () =>')
    expect(source).toContain('notFoundComponent: NotFoundComponent')
  })
})
