import { Languages, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

type LocalizationPanelProps = {
  preferredLanguage?: string
  prompt?: string
}

type TranslateResult = {
  translation?: string
  locale?: string
  translated?: boolean
  skipped?: string
  error?: string
}

export const LocalizationPanel = ({
  preferredLanguage = 'en',
  prompt = '',
}: LocalizationPanelProps) => {
  const [locale, setLocale] = useState(preferredLanguage || 'en')
  const [text, setText] = useState(prompt)
  const [result, setResult] = useState<TranslateResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string>()
  const [hasEditedText, setHasEditedText] = useState(false)

  useEffect(() => {
    setLocale(preferredLanguage || 'en')
  }, [preferredLanguage])

  useEffect(() => {
    if (!hasEditedText) setText(prompt)
  }, [hasEditedText, prompt])

  const translate = async () => {
    setError(undefined)
    setIsTranslating(true)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      })
      const data = (await response.json()) as TranslateResult
      if (!response.ok) throw new Error(data.error ?? 'Translation failed')
      setResult(data)
    } catch (translateError) {
      setResult(null)
      setError(translateError instanceof Error ? translateError.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Languages className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">Localization</h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">Use the current translation endpoint with this session's preferred language.</p>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
          Locale
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
            onChange={(event) => setLocale(event.target.value)}
            value={locale}
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
          Text
          <textarea
            className="min-h-32 resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case leading-5 tracking-normal text-white outline-none"
            onChange={(event) => {
              setHasEditedText(true)
              setText(event.target.value)
            }}
            value={text}
          />
        </label>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isTranslating || !text.trim()}
          onClick={() => void translate()}
          type="button"
        >
          <Send className="size-4" />
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </section>

      {result && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">Result</p>
            <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-white/34">
              {result.translated ? 'translated' : result.skipped ?? 'unchanged'}
            </p>
          </div>
          <p className="m-0 whitespace-pre-wrap text-sm leading-6 text-white/72">{result.translation}</p>
        </section>
      )}

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
