import { useEffect, useRef, forwardRef } from "react"
import {
  applyThemeVars,
  injectThemeFonts,
  clearThemeVars,
} from "../../genui/theme-apply"
import type { ThemeStyles } from "../../genui/theme-presets"

// Renders children in a scoped div container with theme CSS custom properties applied.
// Theme changes only affect this container, not the app chrome (TopBar).
const DirectPreview = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    themeStyles: ThemeStyles | null
    isDark: boolean
  }
>(({ children, themeStyles, isDark }, ref) => {
  const internalRef = useRef<HTMLDivElement | null>(null)
  const root = (ref as React.RefObject<HTMLDivElement>) || internalRef

  useEffect(() => {
    const currentRoot = root.current || internalRef.current
    if (!currentRoot) return

    if (themeStyles) {
      applyThemeVars(currentRoot, themeStyles, isDark)
      injectThemeFonts(document, themeStyles)
    } else {
      clearThemeVars(currentRoot)
      currentRoot.classList.toggle("dark", isDark)
      currentRoot.style.colorScheme = isDark ? "dark" : "light"
    }
  }, [themeStyles, isDark, root])

  return (
    <div ref={root} className="genui-preview size-full bg-background overflow-auto">
      {children}
    </div>
  )
})

DirectPreview.displayName = 'DirectPreview'

export default DirectPreview
