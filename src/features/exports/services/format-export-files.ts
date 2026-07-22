import { createHash } from 'node:crypto'
import { format } from 'prettier'

/**
 * Prettier options shared across all Ship Fast export artifacts.
 * Mirrors the repo's prettier.config.js so exported code matches the
 * formatting users see in the source repository.
 */
export const EXPORT_PRETTIER_OPTIONS = {
  printWidth: 90,
  semi: false,
  singleQuote: true,
  trailingComma: 'all' as const,
}

const FORMAT_OPTIONS_HASH_SALT = JSON.stringify(EXPORT_PRETTIER_OPTIONS)

/**
 * Pluggable content-addressed cache for formatted file output. Formatting a
 * given (parser, options, raw content) tuple is a pure function, so callers
 * can persist hits across builds/sessions — a prettier option change alters
 * every hash and naturally busts stale entries, no manual invalidation.
 */
export type FormatFileCache = {
  get: (hashes: string[]) => Promise<Record<string, string>>
  set: (entries: Array<{ hash: string; content: string }>) => Promise<void>
}

function parserForPath(
  path: string,
): 'babel-ts' | 'babel' | 'json' | 'css' | 'markdown' | null {
  // Vendored third-party dependency bundles (npm packages copied verbatim into the
  // export, e.g. client/vendor/tailwind-merge/dist/bundle-mjs.mjs) are not
  // human-edited source — they arrive already built/minified. Running Prettier over
  // one is both pointless (it's not meant to read nicely) and unsafe: a large
  // pre-minified bundle can pathologically stall Babel's parser for tens of
  // seconds, and with dozens of vendored files queued behind it on Node's single
  // thread, that one file's stall serializes the entire export build and can blow
  // past the platform's action time limit. Exclude the whole vendor tree.
  if (path.includes('/vendor/')) return null
  if (path === 'client/lib/compiled-tailwind.ts') return null
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'babel-ts'
  if (path.endsWith('.mjs') || path.endsWith('.js')) return 'babel'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.md')) return 'markdown'
  return null
}

function formatCacheHash(parser: string, content: string): string {
  return createHash('sha256')
    .update(parser)
    .update(' ')
    .update(FORMAT_OPTIONS_HASH_SALT)
    .update(' ')
    .update(content)
    .digest('hex')
}

/**
 * Format every formattable file in an export bundle with the shared Ship Fast
 * prettier config. Files prettier cannot parse (or any per-file failure) fall
 * back to their original content so a single bad file never breaks an export.
 *
 * When `cache` is supplied, each file's formatted output is looked up by a
 * hash of its raw content before running Prettier, and newly formatted output
 * is written back — so a rebuild where most files are byte-identical to the
 * last build (e.g. only the theme or logo changed) reformats only the files
 * that actually changed.
 */
export async function formatExportFiles(
  files: Record<string, string>,
  cache?: FormatFileCache,
): Promise<Record<string, string>> {
  const entries = Object.entries(files)
  const parsers = entries.map(([path]) => parserForPath(path))
  const hashes = entries.map(([, content], index) => {
    const parser = parsers[index]
    return parser ? formatCacheHash(parser, content) : null
  })

  const lookupHashes = cache
    ? hashes.filter((hash): hash is string => hash !== null)
    : []
  const cacheHits =
    lookupHashes.length > 0 && cache ? await cache.get(lookupHashes) : {}

  const newCacheEntries: Array<{ hash: string; content: string }> = []

  const formatted = await Promise.all(
    entries.map(async ([path, content], index) => {
      const parser = parsers[index]
      if (!parser) return [path, content] as const

      const hash = hashes[index]
      if (hash !== null && cacheHits[hash] !== undefined) {
        return [path, cacheHits[hash]] as const
      }

      try {
        const result = await format(content, {
          parser,
          ...EXPORT_PRETTIER_OPTIONS,
        })
        if (hash !== null) newCacheEntries.push({ hash, content: result })
        return [path, result] as const
      } catch {
        return [path, content] as const
      }
    }),
  )

  if (cache && newCacheEntries.length > 0) {
    await cache.set(newCacheEntries)
  }

  return Object.fromEntries(formatted)
}
