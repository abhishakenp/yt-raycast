export const GALLERY_PAGE_SIZE = 12
export const GENERATION_LIMIT = 2
export const GENERATION_LIMIT_WITH_BONUS = 3
export const MIN_PROMPT_LENGTH = 15
export const PROMPT_LANG_DETECT_MIN_CHARS = 65
export const PROMPT_LANG_DETECT_DEBOUNCE_MS = 400
export const PROMPT_LANG_DETECT_SNIPPET_MAX = 800
export const PROMPT_SUGGEST_MIN_CHARS = 2
export const PROMPT_SUGGEST_MAX_SHOW = 4
export const PROMPT_SUGGEST_DEBOUNCE_MS = 380
export const PREFERRED_LANGUAGE_KEY = 'sf_preferred_language'
export const GITHUB_TOKEN_STORAGE_KEY = 'sf_github_access_token'
export const SUBMIT_BTN_DEFAULT_LABEL = 'Generate'

export const isLocalDevHost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1')
