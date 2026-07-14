// Augment React's CSSProperties to allow CSS custom properties (--var-name).
// Without this, every `style={{ '--foo': value } as React.CSSProperties}`
// would need a type assertion.
import 'react'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined
  }
}

export {}
