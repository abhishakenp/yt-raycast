import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ArrowLeftIcon, Type, Wand2 } from 'lucide-react'
import ThemePicker from '../../genui/components/ThemePicker'

interface TopBarProps {
  id: string
  prompt: string | null | undefined
  moduleCount: number
  elapsed: number | null | undefined
  themeName: string | null
  isDark: boolean
  onSelectTheme: (name: string) => void
  onToggleMode: () => void
  editMode?: boolean
  onToggleEditMode?: () => void
  aiEditMode?: boolean
  onToggleAIEditMode?: () => void
  rightActions?: ReactNode
}

function TopBar({
  id,
  prompt,
  moduleCount,
  elapsed,
  themeName,
  isDark,
  onSelectTheme,
  onToggleMode,
  editMode,
  onToggleEditMode,
  aiEditMode,
  onToggleAIEditMode,
  rightActions,
}: TopBarProps) {
  return (
    <div
      className="flex h-10 shrink-0 items-center gap-1 border-b border-border/60 bg-background py-0 pl-2 pr-4"
      data-session-id={id}
    >
      <div className="flex flex-1 items-center gap-1">
        <Link
          to="/"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Home"
        >
          <ArrowLeftIcon className="size-4" />
        </Link>

        <span
          className="ml-1 min-w-0 truncate text-xs text-muted-foreground"
          title={prompt ?? ''}
        >
          {prompt ?? '—'}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <span className="hidden pr-1 text-xs text-muted-foreground sm:inline">
          {elapsed != null
            ? `${moduleCount} modules · ${(elapsed / 1000).toFixed(1)}s`
            : null}
        </span>

        {onToggleEditMode && (
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
              editMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title={editMode ? 'Exit text edit mode' : 'Edit text content'}
          >
            <Type className="size-4" />
          </button>
        )}

        {onToggleAIEditMode && (
          <button
            type="button"
            onClick={onToggleAIEditMode}
            className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
              aiEditMode
                ? 'bg-purple-600 text-white'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title={aiEditMode ? 'Exit AI edit mode' : 'AI rewrite text'}
          >
            <Wand2 className="size-4" />
          </button>
        )}

        {rightActions}

        <ThemePicker
          value={themeName}
          isDark={isDark}
          onSelect={onSelectTheme}
          onToggleMode={onToggleMode}
        />
      </div>
    </div>
  )
}

export default TopBar
