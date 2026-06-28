import { useState, useRef, useEffect } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  type VirtualElement,
} from '@floating-ui/react'
import {
  X,
  Sparkles,
  Trash2,
  ChevronUp,
  ChevronDown,
  Undo2,
  Redo2,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Textarea } from '#/components/ui/textarea'
import type { InspectorSelection } from '../element-path'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface SectionPromptToolbarProps {
  isOpen: boolean
  anchorRect: DOMRect | null
  selection: InspectorSelection | null
  onClose: () => void
  onSubmit?: (prompt: string) => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSubmitting?: boolean
  error?: string
}

export function SectionPromptToolbar({
  isOpen,
  anchorRect,
  selection,
  onClose,
  onSubmit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isSubmitting = false,
  error,
}: SectionPromptToolbarProps) {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Use the same floating-ui engine that radix/shadcn popovers use. The anchor
  // is a virtual element built from the selection's bounding rect, so flip +
  // shift handle all collision detection automatically — no manual math.
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  // Update the virtual reference whenever the anchor rect changes. Using
  // setPositionReference with a VirtualElement avoids the type mismatch that
  // passing a plain object to `elements.reference` causes.
  useEffect(() => {
    if (!anchorRect) return
    refs.setPositionReference({
      getBoundingClientRect: () => anchorRect,
    } as VirtualElement)
  }, [anchorRect, refs])

  // Reset the prompt when a new element is selected.
  useEffect(() => {
    if (isOpen) setPrompt('')
  }, [isOpen, selection])

  // Focus the textarea when the toolbar opens.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [isOpen])

  // Prevent mousedown on the toolbar from reaching the document listener
  // in useElementInspector (which would clear the selection).
  const stopMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSubmit = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isSubmitting) return
    onSubmit?.(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isOpen || !anchorRect || !selection) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={refs.setFloating}
        className="section-prompt-toolbar fixed flex w-[360px] flex-col gap-2 rounded-lg border border-white/10 bg-[#0b0d14]/95 p-3 shadow-2xl backdrop-blur-xl"
        style={{ ...floatingStyles, zIndex: 2147483647 }}
        onMouseDown={stopMouseDown}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <Sparkles className="size-3.5 text-cyan-300" />
            AI edit
          </span>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isSubmitting}
                    className="grid size-6 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Move section up"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Move section up</TooltipContent>
              </Tooltip>
            )}
            {onMoveDown && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isSubmitting}
                    className="grid size-6 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Move section down"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Move section down</TooltipContent>
              </Tooltip>
            )}
            {onUndo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onUndo}
                    disabled={isSubmitting || !canUndo}
                    className="grid size-6 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Undo"
                  >
                    <Undo2 className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Undo last edit</TooltipContent>
              </Tooltip>
            )}
            {onRedo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onRedo}
                    disabled={isSubmitting || !canRedo}
                    className="grid size-6 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Redo"
                  >
                    <Redo2 className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Redo last undone edit</TooltipContent>
              </Tooltip>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="grid size-6 place-items-center rounded text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete section"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this section?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide the selected section from the page. You can
                      undo this by reverting the edit.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid size-6 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the change…"
          disabled={isSubmitting}
          className="min-h-[72px] resize-none border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:border-cyan-300/50 focus-visible:ring-cyan-300/20"
          data-slot="section-prompt-input"
        />

        {error && (
          <p className="text-xs text-red-400" data-slot="section-prompt-error">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!prompt.trim() || isSubmitting}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-md bg-cyan-300 px-3 py-1.5 text-xs font-bold text-slate-950 transition-all',
            'hover:-translate-y-px hover:bg-cyan-200',
            'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <Sparkles className="size-3.5" />
          Generate
        </button>
      </div>
    </TooltipProvider>
  )
}
