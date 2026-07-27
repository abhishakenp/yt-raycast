// v3 engine — incremental streaming parser for live compilation.
import type { ParsedSitePlan, Section } from './types.ts'
import { parseSectionLine } from './parser.ts'

export class StreamingParser {
  private buffer = ''
  private kind = ''
  private kindSeen = false
  private sections: Section[] = []
  private pages_: string[] = []
  private sectionStartCb?: (role: string) => void
  private sectionCompleteCb?: (section: Section) => void
  private metadataCb?: (key: 'brand' | 'title' | 'nav', value: string) => void
  // Reasoning block tracking — skip lines inside <reasoning>...</reasoning>
  private inReasoning = false
  // Svelte block collection — collect raw lines between @svelte and @endsvelte
  private inSvelteBlock = false
  private svelteRole: string | null = null
  private svelteBuf: string[] = []
  // Parsed metadata — available as it streams
  private _brand?: string
  private _title?: string
  private _navLabels: Record<string, string> = {}

  onSectionStart(cb: (role: string) => void): void {
    this.sectionStartCb = cb
  }

  onSectionComplete(cb: (section: Section) => void): void {
    this.sectionCompleteCb = cb
  }

  onMetadata(
    cb: (key: 'brand' | 'title' | 'nav', value: string) => void,
  ): void {
    this.metadataCb = cb
  }

  get brand(): string | undefined {
    return this._brand
  }

  get title(): string | undefined {
    return this._title
  }

  get navLabels(): Record<string, string> {
    return this._navLabels
  }

  get pages(): string[] {
    return this.pages_
  }

  /** Process a chunk: split on line boundaries, handle complete lines, keep partial tail. */
  feed(chunk: string): void {
    this.buffer += chunk
    let nl: number
    while ((nl = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, nl)
      this.buffer = this.buffer.slice(nl + 1)
      this.handleLine(line)
    }
  }

  private handleLine(rawLine: string): void {
    // Inside a @svelte block — collect everything verbatim
    if (this.inSvelteBlock) {
      if (
        rawLine.trim() === '@endsvelte' ||
        rawLine.trim().startsWith('@endsvelte')
      ) {
        const role = this.svelteRole ?? ''
        const source = this.svelteBuf.join('\n').trim()
        if (role.length > 0 && source.length > 0) {
          const section: Section = { role, content: [], svelte: { source } }
          this.sections.push(section)
          this.sectionCompleteCb?.(section)
        }
        this.inSvelteBlock = false
        this.svelteRole = null
        this.svelteBuf = []
        return
      }
      this.svelteBuf.push(rawLine)
      return
    }

    const line = rawLine.trim()
    if (line.length === 0) return
    if (line.startsWith('#')) return

    // Skip reasoning blocks — cognitive scaffolding, not part of the DSL.
    if (this.inReasoning) {
      if (/<\/reasoning>/i.test(line)) this.inReasoning = false
      return
    }
    if (/<reasoning>/i.test(line)) {
      if (/<\/reasoning>/i.test(line)) return // same-line block
      this.inReasoning = true
      return
    }

    // @svelte block start
    if (line.startsWith('@svelte')) {
      this.svelteRole = line.replace(/^@svelte\s*/, '').trim()
      this.svelteBuf = []
      this.inSvelteBlock = true
      this.sectionStartCb?.(this.svelteRole)
      return
    }

    // @type line — skip (app vs website marker)
    if (line.startsWith('@type')) return

    if (!this.kindSeen) {
      this.kind = line.split(/\s+/)[0] ?? ''
      this.kindSeen = true
      return
    }

    if (line.startsWith('@pages')) {
      const rest = line.replace(/^@pages\s*/, '').trim()
      if (rest.length > 0) {
        for (const p of rest.split(/\s+/)) {
          if (p.length > 0) this.pages_.push(p)
        }
      }
      return
    }

    if (
      line.startsWith('@brand') ||
      line.startsWith('@title') ||
      line.startsWith('@nav')
    ) {
      if (line.startsWith('@brand')) {
        const value = line.replace(/^@brand\s*/, '').trim()
        if (value) {
          this._brand = value
          this.metadataCb?.('brand', value)
        }
      } else if (line.startsWith('@title')) {
        const value = line.replace(/^@title\s*/, '').trim()
        if (value) {
          this._title = value
          this.metadataCb?.('title', value)
        }
      } else if (line.startsWith('@nav')) {
        // @nav format: home:Home about:About contact:Contact
        const rest = line.replace(/^@nav\s*/, '').trim()
        if (rest) {
          for (const token of rest.split(/\s+/)) {
            const colonIdx = token.indexOf(':')
            if (colonIdx > 0) {
              const key = token.slice(0, colonIdx).trim()
              const val = token.slice(colonIdx + 1).trim()
              if (key && val) {
                this._navLabels[key] = val
                this.metadataCb?.('nav', `${key}:${val}`)
              }
            }
          }
        }
      }
      return // metadata lines — handled here, not as sections
    }

    const firstChar = line[0] ?? ''
    if (/[A-Za-z_]/.test(firstChar)) {
      const role = line.split(/\s+/)[0] ?? ''
      this.sectionStartCb?.(role)
      const section = parseSectionLine(line)
      this.sections.push(section)
      this.sectionCompleteCb?.(section)
      return
    }
  }

  /** Flush any remaining buffered partial line and return the full plan. */
  flush(): ParsedSitePlan {
    if (this.buffer.length > 0) {
      const remaining = this.buffer
      this.buffer = ''
      this.handleLine(remaining)
    }
    // If still inside a @svelte block at flush, finalize it
    if (this.inSvelteBlock && this.svelteRole) {
      const source = this.svelteBuf.join('\n').trim()
      if (source.length > 0) {
        const section: Section = {
          role: this.svelteRole,
          content: [],
          svelte: { source },
        }
        this.sections.push(section)
        this.sectionCompleteCb?.(section)
      }
      this.inSvelteBlock = false
      this.svelteRole = null
      this.svelteBuf = []
    }
    return {
      kind: this.kind,
      sections: this.sections.slice(),
      pages: this.pages_.slice(),
    }
  }
}
