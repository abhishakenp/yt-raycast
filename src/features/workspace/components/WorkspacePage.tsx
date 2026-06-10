import { Link } from '@tanstack/react-router'
import { Download, ExternalLink, Home, PackageCheck, Rocket, User } from 'lucide-react'
import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useWorkspaceController } from '@/features/workspace/hooks/useWorkspaceController'
import { useAuthController } from '@/features/auth/hooks/useAuthController'
import { ClaimPanel } from '@/features/auth/components/ClaimPanel'
import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { EditPanel } from '@/features/editing/components/EditPanel'
import { useEditController } from '@/features/editing/hooks/useEditController'
import { AgentationPanel } from '@/features/agentation/components/AgentationPanel'
import { useAgentationController } from '@/features/agentation/hooks/useAgentationController'
import { CmsPanel } from '@/features/cms/components/CmsPanel'
import { CommercePanel } from '@/features/commerce/components/CommercePanel'
import TopBar from '@/components/GenUI/TopBar'
import AgentationSessionBridge from '@/components/GenUI/AgentationSessionBridge'
import { AIPromptBox } from '@/components/GenUI/AIPromptBox'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import styles from './WorkspacePage.module.css'

type WorkspacePageProps = {
  sessionId: string
}

type AISelection = {
  text: string
  rect: DOMRect
}

export const WorkspacePage = ({ sessionId }: WorkspacePageProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [aiEditMode, setAiEditMode] = useState(false)
  const [agentationEnabled, setAgentationEnabled] = useState(false)
  const [aiSelection, setAiSelection] = useState<AISelection | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showIntroLoader, setShowIntroLoader] = useState(true)

  const {
    canExport,
    canPublish,
    deploymentUrl,
    exportButtonLabel,
    exportDownloadUrl,
    exportError,
    generationState,
    hasPreview,
    isExporting,
    isPublishing,
    logs,
    prompt,
    progress,
    previewHtml,
    publishButtonLabel,
    publishError,
    publishPreview,
    exportHtml,
  } = useWorkspaceController(sessionId)

  const { annotations } = useAgentationController(sessionId)
  const { applyEdit } = useEditController(sessionId)

  const taskCount = generationState.tasks.length
  const loaderProgress = hasPreview ? 1 : progress
  const generationFailed = generationState.status === 'failed'

  const handleInlineTextChange = useCallback(
    ({ oldText, newText, targetLabel }: { oldText: string; newText: string; targetLabel?: string }) => {
      void applyEdit('text', targetLabel, oldText, newText, undefined)
    },
    [applyEdit],
  )

  useIframeTextEdit(previewFrameRef, editMode, handleInlineTextChange)

  const { clearSelection } = useIframeAITextEdit(previewFrameRef, aiEditMode, setAiSelection)

  const handleAIRewrite = useCallback(
    async (instruction: string) => {
      if (!aiSelection) return
      setAiLoading(true)

      try {
        const response = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiSelection.text, instruction }),
        })

        if (!response.ok) throw new Error('AI rewrite failed')

        const result = (await response.json()) as { rewritten?: string }
        const rewritten = result.rewritten?.trim()

        if (rewritten && rewritten !== aiSelection.text) {
          replaceIframeText(previewFrameRef.current, aiSelection.text, rewritten)
          void applyEdit('ai_rewrite', undefined, aiSelection.text, rewritten, instruction)
        }
      } catch (error) {
        console.error('[AI Edit] Failed:', error)
      } finally {
        setAiLoading(false)
        clearSelection()
      }
    },
    [aiSelection, applyEdit, clearSelection],
  )

  const handleToggleAgentation = useCallback(() => {
    setAgentationEnabled((enabled) => !enabled)
    setEditMode(false)
    setAiEditMode(false)
    setAiSelection(null)
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (generationFailed) {
      setShowIntroLoader(false)
      return
    }

    if (!hasPreview) {
      setShowIntroLoader(true)
      return
    }

    const timer = window.setTimeout(() => setShowIntroLoader(false), 650)
    return () => window.clearTimeout(timer)
  }, [generationFailed, hasPreview])

  return (
    <main className={styles.workspace}>
      {showIntroLoader && (
        <div className={styles.introOverlaySlot} aria-label="Generating website">
          <IntroLoader phase="compose" progress={loaderProgress} logs={logs} />
        </div>
      )}

      <GeneratedTopBar
        sessionId={sessionId}
        prompt={prompt}
        moduleCount={taskCount}
        status={generationState.status}
      />

      <AgentationSessionBridge enabled={agentationEnabled} sessionId={sessionId} />

      <section className={styles.previewShell} aria-label="Generated website preview">
        <div className={styles.topBarSlot}>
          {isClient ? (
            <TopBar
              id={sessionId}
              prompt={prompt ?? sessionId}
              moduleCount={taskCount}
              elapsed={null}
              themeName={selectedTheme}
              isDark={isDark}
              onSelectTheme={setSelectedTheme}
              onToggleMode={() => setIsDark((value) => !value)}
              editMode={editMode}
              onToggleEditMode={() => {
                setEditMode((value) => !value)
                setAiEditMode(false)
                setAiSelection(null)
              }}
              aiEditMode={aiEditMode}
              onToggleAIEditMode={() => {
                setAiEditMode((value) => !value)
                setEditMode(false)
                setAiSelection(null)
              }}
              agentationEnabled={agentationEnabled}
              agentationAnnotationCount={annotations?.length ?? 0}
              onToggleAgentation={handleToggleAgentation}
              rightActions={<IdentityTopBarButton sessionId={sessionId} />}
            />
          ) : null}
        </div>

        <div className={styles.previewBody}>
          <div
            className={`${styles.previewMain} ${
              editMode ? styles.inlineEditActive : aiEditMode ? styles.aiEditActive : ''
            }`}
          >
            {aiEditMode && aiSelection && (
              <AIPromptBox
                text={aiSelection.text}
                rect={aiSelection.rect}
                onSubmit={handleAIRewrite}
                onCancel={clearSelection}
                isLoading={aiLoading}
              />
            )}
            {hasPreview ? (
              <iframe
                ref={previewFrameRef}
                className={styles.previewFrame}
                sandbox="allow-same-origin allow-scripts"
                srcDoc={previewHtml}
                title={`Preview for ${prompt ?? sessionId}`}
              />
            ) : (
              <iframe
                ref={previewFrameRef}
                className={styles.previewFrame}
                sandbox="allow-same-origin allow-scripts"
                srcDoc={previewHtml}
                title={`Queued preview for ${prompt ?? sessionId}`}
              />
            )}
          </div>

          <aside className={styles.panel}>
          <ClaimPanel sessionId={sessionId} />

          <section className={styles.toolCard} aria-label="Publish generated website">
            <div className={styles.toolHeading}>
              <Rocket aria-hidden="true" />
              <div>
                <strong>Publish</strong>
                <span>{deploymentUrl !== undefined ? deploymentUrl : 'Publish the Convex preview when it is ready.'}</span>
              </div>
            </div>
            <button
              className={styles.primaryAction}
              disabled={!canPublish}
              onClick={() => void publishPreview()}
              type="button"
            >
              <Rocket aria-hidden="true" />
              {publishButtonLabel}
            </button>
            {deploymentUrl !== undefined && (
              <a
                className={styles.secondaryAction}
                href={deploymentUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" />
                <span className="truncate">{deploymentUrl}</span>
              </a>
            )}
            {publishError !== undefined && (
              <p className={styles.errorText}>{publishError}</p>
            )}
            {isPublishing && <p className={styles.statusText}>Preparing generated subdomain.</p>}
          </section>

          <section className={styles.toolCard} aria-label="Export generated website">
            <div className={styles.toolHeading}>
              <PackageCheck aria-hidden="true" />
              <div>
                <strong>Exports</strong>
                <span>Build and download the durable HTML preview from Convex.</span>
              </div>
            </div>
            <button
              className={styles.primaryAction}
              disabled={!canExport}
              onClick={() => void exportHtml()}
              type="button"
            >
              <Download aria-hidden="true" />
              {exportButtonLabel}
            </button>
            {exportDownloadUrl !== undefined && (
              <a
                className={styles.secondaryAction}
                href={exportDownloadUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download aria-hidden="true" />
                <span>Download HTML</span>
              </a>
            )}
            {exportError !== undefined && (
              <p className={styles.errorText}>{exportError}</p>
            )}
            {isExporting && <p className={styles.statusText}>Preparing export...</p>}
          </section>

          <EditPanel sessionId={sessionId} />
          <ChatPanel sessionId={sessionId} />
          <AgentationPanel sessionId={sessionId} />
          <CmsPanel sessionId={sessionId} />
          <CommercePanel sessionId={sessionId} />

          <section className={styles.toolCard} aria-label="Generation tasks">
            <div className={styles.toolHeading}>
              <Rocket aria-hidden="true" />
              <div>
                <strong>Generation tasks</strong>
              </div>
            </div>
            <div className={styles.taskList}>
              {generationState.tasks.map((task) => (
                <div className={styles.taskCard} key={task.taskKey}>
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{task.status}</p>
                </div>
              ))}
            </div>
          </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function IdentityTopBarButton({ sessionId }: { sessionId: string }) {
  const { canClaim, claimSession, isAnonymousOwner, isClaiming, isOwned, userId } =
    useAuthController(sessionId)

  if (!isAnonymousOwner && !isOwned) return null

  if (isOwned) {
    return (
      <button
        type="button"
        className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-emerald-200 hover:bg-accent hover:text-foreground"
        title={userId ? `Owned by ${userId}` : 'Owned by you'}
      >
        <User className="size-4" />
        <span className="hidden sm:inline">Identified</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
      disabled={!canClaim}
      onClick={() => void claimSession()}
      title="Identify and claim this project"
    >
      <User className="size-4" />
      <span className="hidden sm:inline">{isClaiming ? 'Identifying...' : 'Identify'}</span>
    </button>
  )
}

function GeneratedTopBar({
  sessionId,
  prompt,
  moduleCount,
  status,
}: {
  sessionId: string
  prompt: string | undefined
  moduleCount: number
  status: string
}) {
  return (
    <header className={styles.generateTopbar} data-session-id={sessionId}>
      <div className={styles.generateTopbarLeft}>
        <Link to="/" className={styles.topbarIconLink} title="Home" aria-label="Back home">
          <Home aria-hidden="true" />
        </Link>
        <span className={styles.topbarSessionTitle} title={prompt ?? sessionId}>
          {prompt ?? sessionId}
        </span>
      </div>
      <div className={styles.generateTopbarRight}>
        <span>{moduleCount} modules</span>
        <span>{status}</span>
      </div>
    </header>
  )
}

function useIframeTextEdit(
  frameRef: RefObject<HTMLIFrameElement | null>,
  editMode: boolean,
  onTextChange: (change: { oldText: string; newText: string; targetLabel?: string }) => void,
) {
  const callbackRef = useRef(onTextChange)
  callbackRef.current = onTextChange

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    let active: { element: HTMLElement; originalText: string } | null = null
    let doc: Document | null = null

    const cleanupElement = (element: HTMLElement) => {
      element.contentEditable = 'inherit'
      element.style.outline = ''
      element.style.outlineOffset = ''
      element.style.cursor = ''
    }

    const finishEdit = () => {
      if (!active) return
      const newText = active.element.textContent || ''
      if (newText !== active.originalText && newText.trim()) {
        callbackRef.current({
          oldText: active.originalText,
          newText,
          targetLabel: getElementLabel(active.element),
        })
      }
      cleanupElement(active.element)
      active = null
    }

    const cancelEdit = () => {
      if (!active) return
      active.element.textContent = active.originalText
      cleanupElement(active.element)
      active = null
    }

    const handleClick = (event: MouseEvent) => {
      if (!editMode) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (!target) return

      finishEdit()

      const textElement = findEditableTextElement(target)
      if (!textElement) return

      const originalText = textElement.textContent || ''
      if (!originalText.trim()) return

      textElement.contentEditable = 'true'
      textElement.focus()

      const ownerDocument = textElement.ownerDocument
      const range = ownerDocument.createRange()
      range.selectNodeContents(textElement)
      const selection = ownerDocument.defaultView?.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)

      textElement.style.outline = '2px solid #38bdf8'
      textElement.style.outlineOffset = '3px'
      textElement.style.cursor = 'text'

      active = { element: textElement, originalText }
      event.preventDefault()
      event.stopPropagation()
    }

    const handleBlur = () => finishEdit()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        finishEdit()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelEdit()
      }
    }

    const attach = () => {
      doc = frame.contentDocument
      if (!doc?.body) return
      doc.body.style.cursor = editMode ? 'text' : ''
      doc.addEventListener('click', handleClick, true)
      doc.addEventListener('blur', handleBlur, true)
      doc.addEventListener('keydown', handleKeyDown, true)
    }

    attach()
    frame.addEventListener('load', attach)

    return () => {
      frame.removeEventListener('load', attach)
      doc?.removeEventListener('click', handleClick, true)
      doc?.removeEventListener('blur', handleBlur, true)
      doc?.removeEventListener('keydown', handleKeyDown, true)
      if (doc?.body) doc.body.style.cursor = ''
      finishEdit()
    }
  }, [editMode, frameRef])
}

function useIframeAITextEdit(
  frameRef: RefObject<HTMLIFrameElement | null>,
  aiEditMode: boolean,
  onSelect: (selection: AISelection | null) => void,
) {
  const callbackRef = useRef(onSelect)
  callbackRef.current = onSelect

  const clearSelection = useCallback(() => {
    const frameWindow = frameRef.current?.contentWindow
    frameWindow?.getSelection()?.removeAllRanges()
    callbackRef.current(null)
  }, [frameRef])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    let doc: Document | null = null

    const handleSelection = () => {
      if (!aiEditMode) return
      const frameWindow = frame.contentWindow
      const selection = frameWindow?.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const text = range.toString().trim()
      if (!text || text.length < 2 || text.length > 500) return

      const rect = range.getBoundingClientRect()
      const frameRect = frame.getBoundingClientRect()
      callbackRef.current({
        text,
        rect: new DOMRect(frameRect.left + rect.left, frameRect.top + rect.top, rect.width, rect.height),
      })
    }

    const handleMouseUp = () => {
      window.setTimeout(handleSelection, 50)
    }

    const attach = () => {
      doc = frame.contentDocument
      doc?.addEventListener('mouseup', handleMouseUp)
      doc?.addEventListener('selectionchange', handleSelection)
    }

    attach()
    frame.addEventListener('load', attach)

    return () => {
      frame.removeEventListener('load', attach)
      doc?.removeEventListener('mouseup', handleMouseUp)
      doc?.removeEventListener('selectionchange', handleSelection)
      clearSelection()
    }
  }, [aiEditMode, clearSelection, frameRef])

  return { clearSelection }
}

function replaceIframeText(frame: HTMLIFrameElement | null, oldText: string, newText: string) {
  const doc = frame?.contentDocument
  if (!doc?.body) return

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode() as Text | null

  while (node) {
    const value = node.nodeValue ?? ''
    if (value.includes(oldText)) {
      node.nodeValue = value.replace(oldText, newText)
      return
    }
    node = walker.nextNode() as Text | null
  }
}

function findEditableTextElement(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element

  while (current) {
    const tag = current.tagName.toLowerCase()
    if (['button', 'a', 'input', 'textarea', 'select', 'svg', 'path', 'img', 'video', 'audio', 'script', 'style'].includes(tag)) {
      return null
    }

    const text = (current.textContent || '').trim()
    if (text.length > 0 && text.length < 500) {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'li', 'td', 'th', 'label', 'figcaption', 'strong', 'em', 'small', 'blockquote'].includes(tag)) {
        return current
      }
    }

    current = current.parentElement
  }

  return null
}

function getElementLabel(element: HTMLElement) {
  const text = (element.textContent || '').trim()
  if (text) return text.slice(0, 80)
  return element.tagName.toLowerCase()
}
