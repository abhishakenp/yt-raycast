import { on, post } from './bridge'
import type { AiResponse, PanelOpenPayload } from './types'

let seq = 0

function nextId(): string {
  seq += 1
  return `ed-ai-${Date.now().toString(36)}-${seq}`
}

export interface AiRequestInput {
  state: PanelOpenPayload
  instruction: string
  scope: 'element' | 'section' | 'page'
}

const TIMEOUT_MS = 60_000

export function requestAi(input: AiRequestInput): Promise<AiResponse> {
  return new Promise((resolve) => {
    const id = nextId()
    let settled = false
    let disposeListener: () => void = () => {}
    let timer: ReturnType<typeof setTimeout> | null = null

    const finish = (res: AiResponse): void => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      try {
        disposeListener()
      } catch {
        /* ignore */
      }
      resolve(res)
    }

    disposeListener = on('SF_PREVIEW_STYLE_AI_RES', (data) => {
      const d = data as {
        id?: unknown
        html?: unknown
        styleDiff?: unknown
        error?: unknown
        tokensUsed?: unknown
      }
      if (typeof d.id !== 'string' || d.id !== id) return
      const out: AiResponse = {}
      if (typeof d.error === 'string') out.error = d.error
      if (typeof d.html === 'string' && d.html.length) out.html = d.html
      if (Array.isArray(d.styleDiff)) {
        const arr = d.styleDiff as unknown[]
        const cleaned: AiResponse['styleDiff'] = []
        for (const entry of arr) {
          if (!entry || typeof entry !== 'object') continue
          const e = entry as {
            prop?: unknown
            value?: unknown
            token?: unknown
            important?: unknown
          }
          if (typeof e.prop !== 'string' || typeof e.value !== 'string') continue
          cleaned.push({
            prop: e.prop,
            value: e.value,
            token: typeof e.token === 'string' ? e.token : undefined,
            important: typeof e.important === 'boolean' ? e.important : undefined,
          })
        }
        if (cleaned.length) out.styleDiff = cleaned
      }
      if (typeof d.tokensUsed === 'number') out.tokensUsed = d.tokensUsed
      finish(out)
    })

    timer = setTimeout(() => {
      finish({ error: 'AI request timed out.' })
    }, TIMEOUT_MS)

    try {
      post('SF_PREVIEW_STYLE_AI_REQ', {
        id,
        fragmentHtml: '',
        instruction: input.instruction,
        scope: input.scope,
        computedStyles: input.state.computedStyles,
        tokens: input.state.tokens,
        friendlyLabel: input.state.friendlyLabel,
        eid: input.state.eid,
      })
    } catch {
      finish({ error: 'Failed to dispatch AI request.' })
    }
  })
}
