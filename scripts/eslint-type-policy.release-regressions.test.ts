import tsParser from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import eslintConfig from '../eslint.config.js'

const linter = new Linter({ configType: 'flat' })

function isRuleSeverity(value: unknown): value is Linter.RuleSeverity {
  return (
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 'off' ||
    value === 'warn' ||
    value === 'error'
  )
}

function findPolicyRule(): Linter.RuleEntry {
  const configured = eslintConfig.find(
    (config) => config.rules?.['no-restricted-syntax'],
  )?.rules?.['no-restricted-syntax']

  if (isRuleSeverity(configured)) return configured
  if (!Array.isArray(configured) || !isRuleSeverity(configured[0])) {
    throw new Error('no-restricted-syntax policy is not configured')
  }

  return [configured[0], ...configured.slice(1)]
}

const policyRule = findPolicyRule()

function restrictedMessages(source: string) {
  return linter.verify(source, {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-restricted-syntax': policyRule,
    },
  })
}

describe('ESLint type-safety policy', () => {
  it('allows typed named function declarations', () => {
    const messages = restrictedMessages(`
function parseValue(value: string): number {
  return value.length
}
void parseValue
`)

    expect(messages).toEqual([])
  })

  it('allows typed named function overload declarations', () => {
    const messages = restrictedMessages(`
function normalize(value: string): string
function normalize(value: number): number
function normalize(value: string | number) {
  return value
}
void normalize
`)

    expect(messages).toEqual([])
  })

  it('allows typed direct useCallback declarations', () => {
    const messages = restrictedMessages(`
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const stable = useCallback((value: string): number => value.length, [])
const destructured = useCallback(({ id }: { id: string }): string => id, [])
const withDefault = useCallback((value: string = 'ready'): string => value, [])
void [stable, destructured, withDefault]
`)

    expect(messages).toEqual([])
  })

  it('allows typed React.useCallback declarations', () => {
    const messages = restrictedMessages(`
declare const React: {
  useCallback<Value>(callback: Value, dependencies: unknown[]): Value
}
const stable = React.useCallback(async (value: string): Promise<string> => value, [])
void stable
`)

    expect(messages).toEqual([])
  })

  it('still rejects typed ordinary arrow callbacks and function expressions', () => {
    const messages = restrictedMessages(`
const arrow = (value: string): number => value.length
const expression = function (value: string): number { return value.length }
void [arrow, expression]
`)

    expect(messages).toHaveLength(4)
    expect(messages.map((message) => message.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('parameter annotations are forbidden'),
        expect.stringContaining('return annotations are forbidden'),
      ]),
    )
  })

  it('still rejects typed nested callbacks inside useCallback', () => {
    const messages = restrictedMessages(`
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const stable = useCallback((values: string[]): string[] => {
  return values.map((value: string): string => value.trim())
}, [])
void stable
`)

    expect(messages).toHaveLength(2)
  })

  it('does not extend the useCallback exemption through an arbitrary alias', () => {
    const messages = restrictedMessages(`
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const makeStable = useCallback
const stable = makeStable((value: string): number => value.length, [])
void stable
`)

    expect(messages).toHaveLength(2)
  })

  it('does not apply the useCallback exemption to useMemo callbacks', () => {
    const messages = restrictedMessages(`
declare function useMemo<Value>(factory: () => Value, dependencies: unknown[]): Value
const value = useMemo((): string => 'ready', [])
void value
`)

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain('return annotations are forbidden')
  })

  it('rejects typed class-field arrow functions', () => {
    const messages = restrictedMessages(`
class Formatter {
  format = (value: string): number => value.length
}
void Formatter
`)

    expect(messages).toHaveLength(2)
  })

  it('still rejects every assertion form, non-null assertions, and explicit any', () => {
    const messages = restrictedMessages(`
declare const input: unknown
const asserted = input as string
const angled = <string>input
declare const optional: string | undefined
const forced = optional!
let unsafe: any = input
void [asserted, angled, forced, unsafe]
`)

    expect(messages).toHaveLength(4)
    expect(messages.map((message) => message.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Type assertions are forbidden'),
        expect.stringContaining('Angle-bracket type assertions are forbidden'),
        expect.stringContaining('Non-null assertions are forbidden'),
        expect.stringContaining('Explicit `any` is forbidden'),
      ]),
    )
  })

  it('rejects const assertions and every layer of a chained assertion', () => {
    const messages = restrictedMessages(`
declare const input: unknown
const literal = { status: 'ready' } as const
const chained = input as unknown as string
void [literal, chained]
`)

    expect(messages).toHaveLength(3)
    expect(
      messages.every((message) =>
        message.message.includes('Type assertions are forbidden'),
      ),
    ).toBe(true)
  })

  it('allows satisfies because it verifies compatibility without asserting a new type', () => {
    const messages = restrictedMessages(`
const value = { status: 'ready' } satisfies { status: string }
void value
`)

    expect(messages).toEqual([])
  })

  it('allows useCallback generic declarations with inferred callback parameters', () => {
    const messages = restrictedMessages(`
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const stable = useCallback<(value: string) => number>((value) => value.length, [])
void stable
`)

    expect(messages).toEqual([])
  })

  it('allows inferred anonymous callbacks', () => {
    const messages = restrictedMessages(`
const values = ['a', 'b'].map((value) => value.toUpperCase())
void values
`)

    expect(messages).toEqual([])
  })
})
