import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Error boundary for the generated preview. On crash:
 * - Calls onError so the parent can keep showing the last known good source.
 * - Renders fallback (typically the IntroLoader) while the parent decides
 *   whether to retry with the last good source or keep the loader.
 *
 * Resets when the source key changes — a newer valid source replaces a
 * previously broken one. This enables "last known good" streaming: if a
 * partial source crashes, the previous frame stays; when a newer valid
 * chunk arrives, it replaces the broken render.
 */
export class PreviewErrorBoundary extends Component<{
  children: ReactNode
  fallback: ReactNode
  /** Changes when a new source is attempted — resets the boundary. */
  sourceKey?: string
  onError?: (error: Error, info: ErrorInfo) => void
}> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prev: { sourceKey?: string }) {
    if (prev.sourceKey !== this.props.sourceKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
