import { createParser } from '@openuidev/lang-core'
import { shipFastOpenUIContractLibrary } from '../openui/library/contract.ts'

let _parser = null
function getParser() {
  if (!_parser) {
    _parser = createParser(shipFastOpenUIContractLibrary.toJSONSchema())
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
  const result = getParser().parse(text)
  const errors = result.meta?.errors || []
  const fatal = errors.filter((e) => e && String(e.code || '') !== 'unknown-component')
  const ok = Boolean(result.root) && fatal.length === 0
  return { ok, errors, hasRoot: Boolean(result.root) }
}
