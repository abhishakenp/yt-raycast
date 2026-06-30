// v3 engine — incremental streaming parser for live compilation.
import type {
  CustomOperation,
  CustomTable,
  ParsedSitePlan,
  Section,
} from './types.ts'
import { parseSectionLine, parseSitePlan } from './parser.ts'

export class StreamingParser {
  private buffer = ''
  private kind = ''
  private kindSeen = false
  private sections: Section[] = []
  private pages: string[] = []
  private tables: CustomTable[] = []
  private operations: CustomOperation[] = []
  private sectionStartCb?: (role: string) => void
  private sectionCompleteCb?: (section: Section) => void

  onSectionStart(cb: (role: string) => void): void {
    this.sectionStartCb = cb
  }

  onSectionComplete(cb: (section: Section) => void): void {
    this.sectionCompleteCb = cb
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
    const line = rawLine.trim()
    if (line.length === 0) return
    if (line.startsWith('#')) return

    if (!this.kindSeen) {
      this.kind = line.split(/\s+/)[0] ?? ''
      this.kindSeen = true
      return
    }

    if (line.startsWith('@pages')) {
      const rest = line.replace(/^@pages\s*/, '').trim()
      if (rest.length > 0) {
        for (const p of rest.split(/\s+/)) {
          if (p.length > 0) this.pages.push(p)
        }
      }
      return
    }

    if (line.startsWith('+')) {
      // Defer + lines to flush via full re-parse of accumulated buffer tail.
      // Collect by re-parsing this single line through parseSitePlan on a stub.
      const stub = `${this.kind || 'x'}\n${line}`
      const sub = parseSitePlan(stub)
      for (const t of sub.tables) this.tables.push(t)
      for (const o of sub.operations) this.operations.push(o)
      return
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
    return {
      kind: this.kind,
      sections: this.sections.slice(),
      pages: this.pages.slice(),
      tables: this.tables.slice(),
      operations: this.operations.slice(),
    }
  }
}
