'use client'

import { type ReactElement, useEffect, useMemo, useState } from 'react'
import { Languages, Check, Plus, Loader2 } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Input } from '../../components/ui/input'
import { KNOWN_LANGUAGES, type LanguageEntry } from '../../config/languages'
import { resolveBrowserNativeLanguage } from '../../features/localization/browser-native-language'
import { api } from '../../../convex/_generated/api'
import { cn } from '../../lib/utils'

export interface LanguagePickerProps {
  value: string | null
  onSelect: (language: string) => void
  trigger?: ReactElement
}

/**
 * Full-text match of a user-typed language against an entry's searchable
 * fields (code, name, nativeName, keywords). Case-insensitive, works for both
 * Roman and native-script input.
 */
const matchesEntry = (input: string, entry: LanguageEntry): boolean => {
  const needle = input.trim().toLowerCase()
  if (!needle) return false
  if (entry.code.toLowerCase() === needle) return true
  if (entry.name.toLowerCase() === needle) return true
  if (entry.nativeName.toLowerCase() === needle) return true
  if (entry.keywords.some((k) => k.toLowerCase() === needle)) return true
  return false
}

/**
 * Search the merged language list for an exact match of the typed text. Returns
 * the matching language code, or null when no known/custom language matches.
 */
const findExistingLanguage = (
  input: string,
  languages: LanguageEntry[],
): string | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  for (const entry of languages) {
    if (matchesEntry(trimmed, entry)) return entry.code
  }
  return null
}

const languageDisplayScore = (entry: LanguageEntry): number => {
  const nativeName = entry.nativeName.trim().toLowerCase()
  const name = entry.name.trim().toLowerCase()
  let score = 0
  if (entry.code.length <= 3) score += 1
  if (entry.fontFamily && !/inter,\s*system-ui/i.test(entry.fontFamily)) {
    score += 1
  }
  if (nativeName && nativeName !== name) score += 2
  if ([...entry.nativeName].some((char) => char.charCodeAt(0) > 127)) {
    score += 2
  }
  return score
}

const chooseBetterLanguageEntry = (
  current: LanguageEntry,
  candidate: LanguageEntry,
): LanguageEntry =>
  languageDisplayScore(candidate) > languageDisplayScore(current)
    ? candidate
    : current

const mergeLanguageEntries = (
  known: LanguageEntry[],
  custom: LanguageEntry[],
): LanguageEntry[] => {
  const byKey = new Map<string, LanguageEntry>()
  const order: string[] = []

  for (const entry of [...known, ...custom]) {
    const keys = [
      `code:${entry.code.toLowerCase()}`,
      `name:${entry.name.trim().toLowerCase()}`,
      `native:${entry.nativeName.trim().toLowerCase()}`,
    ].filter((key) => !key.endsWith(':'))
    const existingKey = keys.find((key) => byKey.has(key))

    if (!existingKey) {
      const primaryKey = keys[0]
      order.push(primaryKey)
      for (const key of keys) byKey.set(key, entry)
      continue
    }

    const current = byKey.get(existingKey)!
    const winner = chooseBetterLanguageEntry(current, entry)
    for (const key of keys) byKey.set(key, winner)
    for (const [key, value] of byKey) {
      if (value === current) byKey.set(key, winner)
    }
  }

  return order
    .map((key) => byKey.get(key))
    .filter((entry, index, entries): entry is LanguageEntry =>
      Boolean(
        entry &&
        entries.findIndex((item) => item?.code === entry.code) === index,
      ),
    )
}

export default function LanguagePicker({
  value,
  onSelect,
  trigger,
}: LanguagePickerProps) {
  const [activeLanguage, setActiveLanguage] = useState(value ?? '')
  const [customLanguage, setCustomLanguage] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [repairedCustomLanguages, setRepairedCustomLanguages] = useState<
    LanguageEntry[]
  >([])
  const [supersededCustomCodes, setSupersededCustomCodes] = useState<
    Set<string>
  >(new Set())

  // Custom languages persisted by previous users (AI-generated). Merged with
  // the static KNOWN_LANGUAGES so everyone can search + select them.
  const customLanguages = useQuery(api.customLanguages.list, {})
  const resolveOrCreate = useAction(api.customLanguages.resolveOrCreate)

  useEffect(() => {
    setActiveLanguage(value ?? '')
  }, [value])

  // Repair stale browser-native custom rows: a previous AI run may have stored
  // a language with a non-locale code and a Latin native name (e.g. code
  // "chinese", nativeName "Chinese") even though the browser can translate the
  // proper locale (zh) natively. Resolve each custom row's name AND keywords
  // against the browser-native index and merge the repaired entries in so
  // search results show the real native script + locale code. Rows whose
  // keywords resolve to a different browser-native locale (e.g. a Nahuatl row
  // keyed on "mexican") are superseded and hidden in favor of the repaired
  // browser-native entry.
  useEffect(() => {
    const custom = (customLanguages ?? []) as LanguageEntry[]
    if (custom.length === 0) {
      setRepairedCustomLanguages([])
      setSupersededCustomCodes(new Set())
      return
    }
    let cancelled = false
    void (async () => {
      const results = await Promise.all(
        custom.map(async (entry) => {
          const candidates = [entry.name, ...entry.keywords]
          for (const candidate of candidates) {
            const browserNative = await resolveBrowserNativeLanguage(candidate)
            if (browserNative) {
              return {
                browserNative,
                superseded:
                  browserNative.code !== entry.code ? entry.code : null,
              }
            }
          }
          return null
        }),
      )
      if (!cancelled) {
        const repaired: LanguageEntry[] = []
        const superseded = new Set<string>()
        for (const result of results) {
          if (result?.browserNative) {
            repaired.push(result.browserNative)
            if (result.superseded) superseded.add(result.superseded)
          }
        }
        setRepairedCustomLanguages(repaired)
        setSupersededCustomCodes(superseded)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customLanguages])

  const allLanguages = useMemo<LanguageEntry[]>(
    () =>
      mergeLanguageEntries(KNOWN_LANGUAGES, [
        ...repairedCustomLanguages,
        ...((customLanguages ?? []) as LanguageEntry[]).filter(
          (entry) => !supersededCustomCodes.has(entry.code),
        ),
      ]),
    [customLanguages, repairedCustomLanguages, supersededCustomCodes],
  )

  const submitCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customLanguage.trim()
    if (!trimmed || isResolving) return

    // 1. Fast path: the typed text matches a curated known language — select
    // it synchronously without any async round-trip.
    const knownCode = findExistingLanguage(trimmed, KNOWN_LANGUAGES)
    if (knownCode) {
      onSelect(knownCode)
      setCustomLanguage('')
      return
    }

    // 2. If the browser can translate this language locally, use that locale
    // directly. The on-device translator is the first tier, so a browser-native
    // locale (e.g. es-MX for "Mexican") is preferred over a stale custom row
    // (e.g. a Nahuatl entry keyed on the "mexican" keyword) and skips Convex/AI
    // entirely.
    setIsResolving(true)
    setResolveError(null)
    try {
      const browserNative = await resolveBrowserNativeLanguage(trimmed)
      if (browserNative?.code) {
        onSelect(browserNative.code)
        setCustomLanguage('')
        return
      }

      // 3. Fall back to a previously-persisted custom language row from the DB.
      const existingCode = findExistingLanguage(trimmed, allLanguages)
      if (existingCode) {
        onSelect(existingCode)
        setCustomLanguage('')
        return
      }

      // 4. No match — ask the AI to generate metadata and persist it for
      // future search.
      const result = await resolveOrCreate({ languageInput: trimmed })
      if (result?.code) {
        onSelect(result.code)
        setCustomLanguage('')
      }
    } catch (err) {
      setResolveError(
        err instanceof Error ? err.message : 'Could not add custom language.',
      )
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            title="Language"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Languages className="size-4" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={12}
        className="w-72 p-0"
      >
        <Command value={activeLanguage} onValueChange={setActiveLanguage}>
          <CommandInput placeholder="Search languages…" />
          <CommandList>
            <ScrollArea className="max-h-[360px]">
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {allLanguages.map((entry) => {
                  const searchKeywords = [
                    entry.name,
                    entry.nativeName,
                    ...entry.keywords,
                  ]
                  return (
                    <CommandItem
                      key={entry.code}
                      value={entry.code}
                      keywords={searchKeywords}
                      onSelect={() => onSelect(entry.code)}
                      className="flex flex-col items-start gap-0.5"
                    >
                      <span className="truncate text-sm">{entry.name}</span>
                      {entry.nativeName !== entry.name ? (
                        <span
                          className="truncate text-xs text-muted-foreground"
                          style={{ fontFamily: entry.fontFamily }}
                        >
                          {entry.nativeName}
                        </span>
                      ) : null}
                      <Check
                        className={cn(
                          'absolute right-2 top-1/2 size-4 -translate-y-1/2',
                          value === entry.code ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
        <form
          onSubmit={submitCustom}
          className="flex flex-col gap-1 border-t p-2"
        >
          <div className="flex items-center gap-1">
            <Input
              value={customLanguage}
              onChange={(e) => {
                setCustomLanguage(e.target.value)
                if (resolveError) setResolveError(null)
              }}
              placeholder="Custom language…"
              className="h-8 flex-1"
              disabled={isResolving}
            />
            <button
              type="submit"
              disabled={isResolving}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
              aria-label="Add custom language"
            >
              {isResolving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
            </button>
          </div>
          {resolveError && (
            <p className="px-1 text-xs text-destructive">{resolveError}</p>
          )}
        </form>
      </PopoverContent>
    </Popover>
  )
}
