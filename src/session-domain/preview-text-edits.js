import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseHTML } from 'linkedom'
import { readGeneratedPreviewHtml } from './generated-preview-html.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]+$/
const SHOW_TEXT = 4

function assertSessionId(sessionId) {
  const id = String(sessionId || '').trim()
  if (!SESSION_ID_PATTERN.test(id)) throw new Error('Invalid session id')
  return id
}

function isEditableTextParent(node) {
  const tagName = node?.parentNode?.tagName?.toLowerCase?.()
  return !['script', 'style', 'noscript', 'template'].includes(tagName)
}

export function applyPreviewTextEdit(html, { oldText, newText }) {
  const source = String(html || '')
  const from = String(oldText || '')
  const to = String(newText || '')
  if (!source.trim() || !from.trim()) return { html: source, replaced: false }

  const { document } = parseHTML(source)
  const root = document.body?.childNodes?.length ? document.body : document
  const walker = document.createTreeWalker(root, SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    if (isEditableTextParent(node) && node.nodeValue?.includes(from)) {
      node.nodeValue = node.nodeValue.replace(from, to)
      return { html: document.toString(), replaced: true }
    }
    node = walker.nextNode()
  }

  return { html: source, replaced: false }
}

export function writePreviewTextEdit(
  sessionId,
  { oldText, newText },
  { sessionsDir = DEFAULT_SESSIONS_DIR, now = () => Date.now() } = {},
) {
  const id = assertSessionId(sessionId)
  const originalHtml = readGeneratedPreviewHtml(id, { sessionsDir })
  if (!originalHtml) {
    return { saved: false, reason: 'missing-preview' }
  }

  const result = applyPreviewTextEdit(originalHtml, { oldText, newText })
  if (!result.replaced) {
    return { saved: false, reason: 'text-not-found' }
  }

  const sessionDir = join(sessionsDir, id)
  const editsDir = join(sessionDir, '.preview-edits')
  mkdirSync(editsDir, { recursive: true })

  const timestamp = now()
  writeFileSync(join(editsDir, `${timestamp}.html`), originalHtml)

  const ledgerPath = join(editsDir, 'edits.jsonl')
  const previousLedger = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : ''
  const ledgerEntry = JSON.stringify({
    at: timestamp,
    oldText: String(oldText || ''),
    newText: String(newText || ''),
  })
  writeFileSync(ledgerPath, `${previousLedger}${ledgerEntry}\n`)
  writeFileSync(join(sessionDir, 'index.html'), result.html)

  return { saved: true, html: result.html }
}
