import { createParser } from '@openuidev/lang-core'
import { library as shipFastOpenUILibrary } from '@ship-fast/blocks'

let _parser = null
function getParser() {
  if (!_parser) {
    _parser = createParser(shipFastOpenUILibrary.toJSONSchema())
  }
  return _parser
}

/**
 * @param {string} source
 */
export function validateOpenUISource(source) {
  const text = String(source || '').trim()
  if (!text || text.length < 32) {
    return { ok: false, errors: [{ message: 'OpenUI source too short' }], hasRoot: false }
  }
  if (!/\broot\s*=/.test(text)) {
    return { ok: false, errors: [{ message: 'Missing root assignment' }], hasRoot: false }
  }
  if (!/^\s*root\s*=\s*Stack\s*\(\s*\[/m.test(text)) {
    return { ok: false, errors: [{ message: 'Root must be Stack([childRefs], ...)' }], hasRoot: true }
  }
  const result = getParser().parse(text)
  const errors = result.meta?.errors || []
  const ok = Boolean(result.root) && errors.length === 0
  return { ok, errors, hasRoot: Boolean(result.root) }
}
