import { useCallback, useRef, useState } from 'react'
import { mergeStatements } from '@openuidev/lang-core'
import type { GenUIEvent } from '@ship-fast/engine/genui/orchestrator.ts'

export type SectionStatus = 'pending' | 'building' | 'done' | 'error'

export interface Section {
  id: string
  status: SectionStatus
  attempt: number
}

export interface GenUIState {
  buffer: string
  status: string
  isStreaming: boolean
  done: boolean
  error: string | null
  modules: number
  ms: number | null
  sections: Section[]
  theme: string | null
}

const INITIAL: GenUIState = {
  buffer: '',
  status: '',
  isStreaming: false,
  done: false,
  error: null,
  modules: 0,
  ms: null,
  sections: [],
  theme: null,
}

// mergeStatements returns "" when handed a non-parseable fragment. Never let a
// single malformed module wipe the whole accumulated program — keep the previous
// buffer if the merge collapses or loses the root.
function safeMerge(prev: string, patch: string): string {
  try {
    const next = mergeStatements(prev, patch)
    if (!next || !next.trim()) return prev
    // a valid multi-page program keeps its root; if the merge dropped it, reject
    if (prev.includes('root =') && !next.includes('root =')) return prev
    // the system owns the PageSwitch root; a patch must never replace it
    if (prev.includes('PageSwitch') && !next.includes('PageSwitch')) return prev
    return next
  } catch {
    return prev
  }
}

function setSection(sections: Section[], id: string, patch: Partial<Section>): Section[] {
  const idx = sections.findIndex((s) => s.id === id)
  if (idx === -1) return [...sections, { id, status: 'pending', attempt: 0, ...patch }]
  const next = sections.slice()
  next[idx] = { ...next[idx], ...patch }
  return next
}

function reduce(prev: GenUIState, ev: GenUIEvent): GenUIState {
  switch (ev.type) {
    case 'theme':
      return { ...prev, theme: ev.name }
    case 'status':
      return { ...prev, status: ev.message }
    case 'skeleton':
      return { ...prev, buffer: ev.text }
    case 'plan':
      return {
        ...prev,
        sections: ev.ids.map((id) => ({ id, status: 'pending', attempt: 0 })),
      }
    case 'module_start':
      return { ...prev, sections: setSection(prev.sections, ev.id, { status: 'building' }) }
    case 'module_retry':
      return {
        ...prev,
        sections: setSection(prev.sections, ev.id, { status: 'building', attempt: ev.attempt }),
      }
    case 'module':
      return {
        ...prev,
        buffer: safeMerge(prev.buffer, ev.text),
        sections: setSection(prev.sections, ev.id, {
          status: ev.failed ? 'error' : 'done',
        }),
      }
    case 'done':
      return {
        ...prev,
        isStreaming: false,
        done: true,
        status: 'Done',
        modules: ev.modules,
        ms: ev.ms,
      }
    case 'error':
      return { ...prev, isStreaming: false, error: ev.message }
    default:
      return prev
  }
}

export function useGenUIStream() {
  const [state, setState] = useState<GenUIState>(INITIAL)
  const ctrl = useRef<AbortController | null>(null)

  const start = useCallback(async (prompt: string, model?: string) => {
    ctrl.current?.abort()
    const ac = new AbortController()
    ctrl.current = ac
    setState({ ...INITIAL, status: 'Starting…', isStreaming: true, done: false })

    try {
      const res = await fetch('/api/genui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
        signal: ac.signal,
      })
      if (!res.ok || !res.body) throw new Error(`request failed (${res.status})`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const json = line.slice(5).trim()
          if (!json) continue
          const ev = JSON.parse(json) as GenUIEvent
          setState((prev) => reduce(prev, ev))
        }
      }
      setState((prev) => (prev.isStreaming ? { ...prev, isStreaming: false } : prev))
    } catch (e) {
      const err = e as { name?: string; message?: string }
      if (err?.name !== 'AbortError') {
        setState((prev) => ({ ...prev, isStreaming: false, error: err?.message ?? 'failed' }))
      }
    }
  }, [])

  const stop = useCallback(() => {
    ctrl.current?.abort()
    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [])

  return { ...state, start, stop }
}
