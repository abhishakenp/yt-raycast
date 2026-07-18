import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { slug, parseJson, readFile, writeFile } from './workspace'

const TMP_DIR = join(tmpdir(), `workspace-test-${Date.now()}`)

beforeEach(() => {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true })
})

describe('slug', () => {
  it('converts simple title to slug', () => {
    expect(slug('Hello World')).toBe('hello-world')
  })

  it('converts title with special chars', () => {
    expect(slug('Hello, World!')).toBe('hello-world')
  })

  it('converts title with multiple spaces', () => {
    expect(slug('Hello   World')).toBe('hello-world')
  })

  it('converts title with numbers', () => {
    expect(slug('Page 123 Title')).toBe('page-123-title')
  })

  it('converts title with hyphens and underscores', () => {
    expect(slug('hello-world_test')).toBe('hello-world-test')
  })

  it('converts title with leading/trailing special chars', () => {
    expect(slug('---Hello World---')).toBe('hello-world')
  })

  it('converts empty string to empty string', () => {
    expect(slug('')).toBe('')
  })

  it('converts string with only special chars to empty string', () => {
    expect(slug('!@#$%^&*()')).toBe('')
  })

  it('converts mixed case title', () => {
    expect(slug('HeLLo WoRLD')).toBe('hello-world')
  })

  it('converts title with unicode chars', () => {
    expect(slug('café résumé')).toBe('caf-r-sum')
  })
})

describe('parseJson', () => {
  it('parses valid JSON object', () => {
    expect(parseJson('{"key":"value"}')).toEqual({ key: 'value' })
  })

  it('parses valid JSON with whitespace', () => {
    expect(parseJson('  {"key": "value"}  ')).toEqual({ key: 'value' })
  })

  it('parses JSON embedded in text', () => {
    const text = 'Here is the result: {"name":"test","count":3} and more text'
    expect(parseJson(text)).toEqual({ name: 'test', count: 3 })
  })

  it('parses JSON embedded in markdown code block', () => {
    const text = '```json\n{"key":"value"}\n```'
    expect(parseJson(text)).toEqual({ key: 'value' })
  })

  it('returns null when no JSON object found', () => {
    expect(parseJson('no json here')).toBe(null)
  })

  it('returns null for invalid JSON', () => {
    expect(parseJson('{invalid json}')).toBe(null)
  })

  it('returns null for empty string', () => {
    expect(parseJson('')).toBe(null)
  })

  it('returns null for null input', () => {
    expect(parseJson(null as unknown as string)).toBe(null)
  })

  it('returns null for undefined input', () => {
    expect(parseJson(undefined as unknown as string)).toBe(null)
  })

  it('parses nested JSON object', () => {
    expect(parseJson('{"outer":{"inner":"value"}}')).toEqual({
      outer: { inner: 'value' },
    })
  })

  it('parses JSON with array values', () => {
    expect(parseJson('{"items":[1,2,3]}')).toEqual({ items: [1, 2, 3] })
  })

  it('returns null when first brace pair is invalid JSON', () => {
    const text = 'Some text {not valid} then {"valid":true} end'
    // parseJson starts from the first { and tries to parse incrementally;
    // {not valid} is invalid, and extending to include {"valid":true} also fails
    const result = parseJson(text)
    expect(result).toBe(null)
  })
})

describe('readFile', () => {
  it('reads content from existing file', () => {
    const filename = 'test-read.txt'
    const content = 'Hello, World!'
    writeFile(TMP_DIR, filename, content)
    expect(readFile(TMP_DIR, filename)).toBe(content)
  })

  it('returns null for non-existing file', () => {
    expect(readFile(TMP_DIR, 'nonexistent.txt')).toBe(null)
  })

  it('reads multi-line content correctly', () => {
    const filename = 'multiline.txt'
    const content = 'Line 1\nLine 2\nLine 3'
    writeFile(TMP_DIR, filename, content)
    expect(readFile(TMP_DIR, filename)).toBe(content)
  })

  it('reads JSON content correctly', () => {
    const filename = 'data.json'
    const content = '{"key":"value"}'
    writeFile(TMP_DIR, filename, content)
    expect(readFile(TMP_DIR, filename)).toBe(content)
  })
})

describe('writeFile', () => {
  it('writes content to file correctly', () => {
    const filename = 'test-write.txt'
    const content = 'Written content'
    writeFile(TMP_DIR, filename, content)
    expect(readFile(TMP_DIR, filename)).toBe(content)
  })

  it('overwrites existing file content', () => {
    const filename = 'overwrite.txt'
    writeFile(TMP_DIR, filename, 'original')
    writeFile(TMP_DIR, filename, 'replaced')
    expect(readFile(TMP_DIR, filename)).toBe('replaced')
  })

  it('writes Buffer content correctly', () => {
    const filename = 'buffer.txt'
    const content = Buffer.from('Buffer content', 'utf-8')
    writeFile(TMP_DIR, filename, content)
    expect(readFile(TMP_DIR, filename)).toBe('Buffer content')
  })

  it('writes empty string', () => {
    const filename = 'empty.txt'
    writeFile(TMP_DIR, filename, '')
    expect(readFile(TMP_DIR, filename)).toBe('')
  })

  it('writes to nested path', () => {
    const subdir = join(TMP_DIR, 'subdir')
    if (!existsSync(subdir)) mkdirSync(subdir, { recursive: true })
    // writeFile joins workspace + file, so we need to pass the subdir as workspace
    writeFile(subdir, 'nested.txt', 'nested content')
    expect(readFile(subdir, 'nested.txt')).toBe('nested content')
  })
})
