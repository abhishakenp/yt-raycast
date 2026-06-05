// Type declarations for the JS validator so TS callers (e.g. clone/convert.ts)
// get a real signature instead of an implicit `any` (TS7016).
export interface OpenUIValidationError {
  message: string
}

export interface OpenUIValidationResult {
  ok: boolean
  errors: OpenUIValidationError[]
  hasRoot: boolean
}

export function validateOpenUISource(source: string): OpenUIValidationResult
