import { describe, expect, it } from 'vitest'
import {
  EXPORT_PRETTIER_OPTIONS,
  formatExportFiles,
} from './format-export-files'

describe('formatExportFiles', () => {
  it('formats TypeScript with the shared Ship Fast config (no statement semis, single quotes, trailing commas)', async () => {
    const result = await formatExportFiles({
      'src/App.tsx':
        'import React from "react";\nexport const App = ({name,age}: {name: string; age: number}) => { return <div>{name}{age}</div> }\n',
    })

    const formatted = result['src/App.tsx']
    // single quotes for string literals
    expect(formatted).toContain("from 'react'")
    // no statement-terminating semicolons at end of lines
    expect(formatted).not.toMatch(/;\s*$/m)
    // trailing comma in destructured props
    expect(formatted).toMatch(/\{ name, age \}/)
  })

  it('formats JSON with proper indentation', async () => {
    const result = await formatExportFiles({
      'package.json': '{"name":"demo","version":"1.0.0","deps":{"a":"1"}}',
    })
    const formatted = result['package.json']
    expect(JSON.parse(formatted)).toEqual({
      name: 'demo',
      version: '1.0.0',
      deps: { a: '1' },
    })
    // prettier adds spaces after colons and a trailing newline
    expect(formatted).toContain('"name": "demo"')
    expect(formatted.endsWith('\n')).toBe(true)
  })

  it('formats CSS', async () => {
    const result = await formatExportFiles({
      'src/styles.css': 'body{color:red;background:blue;}',
    })
    expect(result['src/styles.css']).toContain('color: red;')
  })

  it('leaves unsupported extensions untouched', async () => {
    const html = '<!doctype html><html></html>'
    const result = await formatExportFiles({ 'index.html': html })
    expect(result['index.html']).toBe(html)
  })

  it('falls back to original content when a file cannot be parsed', async () => {
    const broken = 'export const X = { : }'
    const result = await formatExportFiles({ 'src/broken.ts': broken })
    expect(result['src/broken.ts']).toBe(broken)
  })

  it('formats markdown', async () => {
    const result = await formatExportFiles({
      'README.md': '# Demo\n\nthis is   a readme',
    })
    expect(result['README.md']).toContain('# Demo')
  })

  it('exposes the shared prettier options matching the repo config', () => {
    expect(EXPORT_PRETTIER_OPTIONS.semi).toBe(false)
    expect(EXPORT_PRETTIER_OPTIONS.singleQuote).toBe(true)
    expect(EXPORT_PRETTIER_OPTIONS.trailingComma).toBe('all')
  })
})
