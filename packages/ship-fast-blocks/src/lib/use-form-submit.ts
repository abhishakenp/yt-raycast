/**
 * useFormSubmit — lightweight form submission hook for generated sites.
 *
 * In the preview runtime, it simulates a successful submission (visual
 * feedback only). In the exported Next.js site, it can be wired to call
 * the generated Convex mutation via the `mutationFn` option.
 *
 * Usage:
 *   const { status, handleSubmit } = useFormSubmit()
 *   <form onSubmit={handleSubmit}>
 *     ...
 *     <button type="submit" disabled={status === 'pending'}>
 *       {status === 'pending' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send'}
 *     </button>
 *   </form>
 */
import { useCallback, useRef, useState } from 'react'

export type FormSubmitStatus = 'idle' | 'pending' | 'success' | 'error'

export interface FormSubmitResult {
  status: FormSubmitStatus
  errorMessage: string | null
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  reset: () => void
}

export function useFormSubmit(options?: {
  mutationFn?: (data: Record<string, unknown>) => Promise<unknown>
  successMessage?: string
  simulateDelay?: number
}): FormSubmitResult {
  const [status, setStatus] = useState<FormSubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setErrorMessage(null)
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (status === 'pending') return

      const form = e.currentTarget
      const formData = new FormData(form)
      const data: Record<string, unknown> = {}
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }

      setStatus('pending')
      setErrorMessage(null)

      try {
        if (options?.mutationFn) {
          await options.mutationFn(data)
        } else {
          // Preview mode: simulate a network request
          const delay = options?.simulateDelay ?? 800
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
        setStatus('success')
        form.reset()
        // Auto-reset to idle after 3 seconds so the form can be used again
        if (resetTimer.current) clearTimeout(resetTimer.current)
        resetTimer.current = setTimeout(() => setStatus('idle'), 3000)
      } catch (err) {
        setStatus('error')
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        )
      }
    },
    [status, options?.mutationFn, options?.simulateDelay],
  )

  return { status, errorMessage, handleSubmit, reset }
}
