import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  Boxes,
  Check,
  Database,
  Download,
  ExternalLink,
  GitBranch,
  Globe2,
  Home,
  MessageSquarePlus,
  PackageCheck,
  RefreshCw,
  Save,
  Trash2,
  Type,
  Wand2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Renderer, library } from '@ship-fast/blocks'
import ThemePicker from '../genui/components/ThemePicker'
import { applyThemeVars, injectThemeFonts, resolveThemeStyles } from '../genui/theme-apply'
import TopBar from '../components/GenUI/TopBar'
import { AIPromptBox } from '../components/GenUI/AIPromptBox'
import { IntroLoader } from '../components/GenUI/IntroLoader'
import DirectPreview from '../components/GenUI/DirectPreview'
import { getStartClerkToken } from '../lib/clerk-token'

const CURRENT_APP_ORIGIN = 'http://localhost:7420'

const sessionInput = z.object({
  sessionId: z.string().min(1),
})

const textEditInput = sessionInput.extend({
  oldText: z.string().min(1),
  newText: z.string(),
})

const aiRewriteInput = z.object({
  text: z.string().min(1),
  instruction: z.string().min(1),
})

const annotationPayloadInput = z.looseObject({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  comment: z.string(),
  element: z.string(),
  elementPath: z.string(),
  timestamp: z.number(),
})

const annotationInput = sessionInput.extend({
  annotation: annotationPayloadInput,
})

const deleteAnnotationInput = sessionInput.extend({
  annotationId: z.string().min(1),
})

const setAgentationInput = sessionInput.extend({
  enabled: z.boolean(),
})

const exportInput = sessionInput.extend({
  target: z.string().min(1),
})

const accessInput = sessionInput.extend({
  ownerSecret: z.string().optional(),
  authToken: z.string().optional(),
})

const githubPushInput = exportInput.extend({
  ownerSecret: z.string().optional(),
  authToken: z.string().optional(),
  githubAccessToken: z.string().min(1),
})

async function resolveRouteClerkUser(authToken = '') {
  if (!authToken) return null
  const { resolveStartClerkUser } = await import('../session-domain/start-auth.js')
  return resolveStartClerkUser({ authToken })
}

const getGeneratedSession = createServerFn({ method: 'GET' })
  .validator(sessionInput)
  .handler(async ({ data }) => {
    const { createFilesystemSessionRepository } = await import(
      '../session-domain/filesystem-session-repository.js'
    )
    const { readGeneratedPreviewHtml } = await import(
      '../session-domain/generated-preview-html.js'
    )
    const { readGeneratedOpenUI } = await import(
      '../session-domain/generated-openui.js'
    )
    const { readAgentationState } = await import(
      '../session-domain/agentation-annotations.js'
    )
    const { readStartExportState } = await import(
      '../session-domain/session-exports.js'
    )
    const { readStartDeploymentState } = await import(
      '../session-domain/session-deployments.js'
    )
    const { readStartGitHubState } = await import(
      '../session-domain/session-github.js'
    )
    const { readStartCmsState } = await import(
      '../session-domain/session-cms.js'
    )
    const repository = createFilesystemSessionRepository()
    const session = repository.get(data.sessionId)
    const readiness = repository.readiness(data.sessionId)
    const exports = session ? readStartExportState(data.sessionId) : null
    const deployment = session ? readStartDeploymentState(data.sessionId) : null
    const github = session ? readStartGitHubState(data.sessionId) : null
    const cms = session ? readStartCmsState(data.sessionId) : null
    return {
      session,
      readiness,
      previewHtml: readGeneratedPreviewHtml(data.sessionId),
      openuiSource: readGeneratedOpenUI(data.sessionId),
      agentation: readAgentationState(data.sessionId),
      exports,
      deployment,
      github,
      cms,
      links: {
        preview: `${CURRENT_APP_ORIGIN}/preview/${data.sessionId}/`,
        currentDashboard: `${CURRENT_APP_ORIGIN}/session/${data.sessionId}`,
        api: `${CURRENT_APP_ORIGIN}/api/sessions/${data.sessionId}`,
      },
    }
  })

const buildGeneratedExport = createServerFn({ method: 'POST' })
  .validator(exportInput)
  .handler(async ({ data }) => {
    const { buildStartSessionExport } = await import(
      '../session-domain/session-exports.js'
    )
    return buildStartSessionExport(data.sessionId, data.target)
  })

const deployGeneratedSession = createServerFn({ method: 'POST' })
  .validator(accessInput)
  .handler(async ({ data }) => {
    const { provisionStartDeployment } = await import(
      '../session-domain/session-deployments.js'
    )
    return provisionStartDeployment(data.sessionId, {
      ownerSecret: data.ownerSecret || '',
      authUser: await resolveRouteClerkUser(data.authToken),
    })
  })

const pushGeneratedGitHub = createServerFn({ method: 'POST' })
  .validator(githubPushInput)
  .handler(async ({ data }) => {
    const { pushStartSessionToGitHub } = await import(
      '../session-domain/session-github.js'
    )
    return pushStartSessionToGitHub(data.sessionId, {
      target: data.target,
      ownerSecret: data.ownerSecret || '',
      authUser: await resolveRouteClerkUser(data.authToken),
      githubAccessToken: data.githubAccessToken,
    })
  })

const provisionGeneratedSanity = createServerFn({ method: 'POST' })
  .validator(accessInput)
  .handler(async ({ data }) => {
    const { provisionStartSanity } = await import(
      '../session-domain/session-cms.js'
    )
    return provisionStartSanity(data.sessionId, {
      ownerSecret: data.ownerSecret || '',
      authUser: await resolveRouteClerkUser(data.authToken),
    })
  })

const provisionGeneratedMedusa = createServerFn({ method: 'POST' })
  .validator(accessInput)
  .handler(async ({ data }) => {
    const { provisionStartMedusa } = await import(
      '../session-domain/session-cms.js'
    )
    return provisionStartMedusa(data.sessionId, {
      ownerSecret: data.ownerSecret || '',
      authUser: await resolveRouteClerkUser(data.authToken),
    })
  })

const setGeneratedAgentationEnabled = createServerFn({ method: 'POST' })
  .validator(setAgentationInput)
  .handler(async ({ data }) => {
    const { setAgentationEnabled } = await import(
      '../session-domain/agentation-annotations.js'
    )
    const { buildAgentationSessionKey } = await import(
      '../agentation/agentation-session.js'
    )
    return setAgentationEnabled(data.sessionId, {
      enabled: data.enabled,
      agentationSessionId: buildAgentationSessionKey(data.sessionId),
    })
  })

const saveGeneratedAnnotation = createServerFn({ method: 'POST' })
  .validator(annotationInput)
  .handler(async ({ data }) => {
    const { upsertAgentationAnnotation } = await import(
      '../session-domain/agentation-annotations.js'
    )
    return upsertAgentationAnnotation(data.sessionId, data.annotation)
  })

const deleteGeneratedAnnotation = createServerFn({ method: 'POST' })
  .validator(deleteAnnotationInput)
  .handler(async ({ data }) => {
    const { deleteAgentationAnnotation } = await import(
      '../session-domain/agentation-annotations.js'
    )
    return deleteAgentationAnnotation(data.sessionId, data.annotationId)
  })

const clearGeneratedAnnotations = createServerFn({ method: 'POST' })
  .validator(sessionInput)
  .handler(async ({ data }) => {
    const { clearAgentationAnnotations } = await import(
      '../session-domain/agentation-annotations.js'
    )
    return clearAgentationAnnotations(data.sessionId)
  })

const savePreviewTextEdit = createServerFn({ method: 'POST' })
  .validator(textEditInput)
  .handler(async ({ data }) => {
    const { writePreviewTextEdit } = await import(
      '../session-domain/preview-text-edits.js'
    )
    return writePreviewTextEdit(data.sessionId, {
      oldText: data.oldText,
      newText: data.newText,
    })
  })

const rewritePreviewText = createServerFn({ method: 'POST' })
  .validator(aiRewriteInput)
  .handler(async ({ data }) => {
    const { rewriteSelectedText } = await import(
      '../session-domain/ai-text-rewrite.js'
    )
    return rewriteSelectedText({
      text: data.text,
      instruction: data.instruction,
    })
  })

export const Route = createFileRoute('/generate/$sessionId')({
  loader: ({ params }) => getGeneratedSession({ data: { sessionId: params.sessionId } }),
  component: GenerateWorkspace,
})

function GenerateWorkspace() {
  const router = useRouter()
  const { session, readiness, previewHtml, openuiSource, agentation, exports, deployment, github, cms, links } = Route.useLoaderData()
  const sessionId = Route.useParams().sessionId
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const directPreviewRef = useRef<HTMLDivElement | null>(null)
  const [currentPreviewHtml, setCurrentPreviewHtml] = useState(previewHtml || '')
  const [editMode, setEditMode] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [replacementText, setReplacementText] = useState('')
  const [rewriteInstruction, setRewriteInstruction] = useState('Make it warmer and concise')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [rewriteStatus, setRewriteStatus] = useState<'idle' | 'rewriting' | 'rewritten' | 'error'>('idle')
  const [rewriteMessage, setRewriteMessage] = useState('')
  const [agentationEnabled, setAgentationEnabledState] = useState(agentation.enabled)
  const [annotations, setAnnotations] = useState(agentation.annotations)
  const [annotationComment, setAnnotationComment] = useState('')
  const [annotationStatus, setAnnotationStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [annotationMessage, setAnnotationMessage] = useState('')
  const [exportTargets, setExportTargets] = useState(exports?.targets || [])
  const [exportStatus, setExportStatus] = useState<'idle' | 'building' | 'downloading' | 'ready' | 'error'>('idle')
  const [exportMessage, setExportMessage] = useState('')
  const [deploymentState, setDeploymentState] = useState(deployment)
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle')
  const [deployMessage, setDeployMessage] = useState('')
  const [githubTargets, setGithubTargets] = useState(github?.targets || [])
  const [githubAccessToken, setGithubAccessToken] = useState('')
  const [githubStatus, setGithubStatus] = useState<'idle' | 'pushing' | 'pushed' | 'error'>('idle')
  const [githubMessage, setGithubMessage] = useState('')
  const [cmsState, setCmsState] = useState(cms)
  const [cmsStatus, setCmsStatus] = useState<'idle' | 'provisioning' | 'ready' | 'error'>('idle')
  const [cmsMessage, setCmsMessage] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [aiEditMode, setAiEditMode] = useState(false)
  const [aiSelection, setAiSelection] = useState<{ text: string; rect: DOMRect } | null>(null)

  useEffect(() => {
    setCurrentPreviewHtml(previewHtml || '')
    setSelectedText('')
    setReplacementText('')
    setRewriteInstruction('Make it warmer and concise')
    setSaveStatus('idle')
    setSaveMessage('')
    setRewriteStatus('idle')
    setRewriteMessage('')
    setAgentationEnabledState(agentation.enabled)
    setAnnotations(agentation.annotations)
    setAnnotationComment('')
    setAnnotationStatus('idle')
    setAnnotationMessage('')
    setExportTargets(exports?.targets || [])
    setExportStatus('idle')
    setExportMessage('')
    setDeploymentState(deployment)
    setDeployStatus('idle')
    setDeployMessage('')
    setGithubTargets(github?.targets || [])
    setGithubAccessToken('')
    setGithubStatus('idle')
    setGithubMessage('')
    setCmsState(cms)
    setCmsStatus('idle')
    setCmsMessage('')
  }, [agentation.annotations, agentation.enabled, cms, deployment, exports?.targets, github?.targets, previewHtml, sessionId])

  useEffect(() => {
    if (!session || currentPreviewHtml) return
    const interval = window.setInterval(() => {
      void router.invalidate()
    }, 2500)
    return () => window.clearInterval(interval)
  }, [currentPreviewHtml, router, session])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    const frameWindow = iframe?.contentWindow
    if (!doc || !frameWindow || !editMode) return

    const handleSelection = () => {
      const text = frameWindow.getSelection()?.toString().trim() || ''
      if (!text) return
      setSelectedText(text)
      setReplacementText(text)
      setSaveStatus('idle')
      setSaveMessage('')
      setRewriteStatus('idle')
      setRewriteMessage('')
    }

    doc.body.style.cursor = 'text'
    doc.addEventListener('mouseup', handleSelection)
    doc.addEventListener('keyup', handleSelection)

    return () => {
      doc.body.style.cursor = ''
      doc.removeEventListener('mouseup', handleSelection)
      doc.removeEventListener('keyup', handleSelection)
    }
  }, [currentPreviewHtml, editMode])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    const frameWindow = iframe?.contentWindow
    if (!doc || !frameWindow) return

    const existing = doc.querySelector('[data-ship-fast-agentation-layer]')
    existing?.remove()

    if (!agentationEnabled || annotations.length === 0) return

    const layer = doc.createElement('div')
    layer.setAttribute('data-ship-fast-agentation-layer', 'true')
    layer.style.position = 'absolute'
    layer.style.inset = '0'
    layer.style.pointerEvents = 'none'
    layer.style.zIndex = '2147483647'

    for (const entry of annotations) {
      const payload = entry.payload || {}
      const marker = doc.createElement('button')
      marker.type = 'button'
      marker.textContent = String(annotations.indexOf(entry) + 1)
      marker.title = entry.comment || 'Annotation'
      marker.style.position = 'absolute'
      marker.style.left = `${Number(payload.x || 0)}px`
      marker.style.top = `${Number(payload.y || 0)}px`
      marker.style.transform = 'translate(-50%, -50%)'
      marker.style.width = '28px'
      marker.style.height = '28px'
      marker.style.borderRadius = '999px'
      marker.style.border = '2px solid white'
      marker.style.background = '#10b981'
      marker.style.color = 'white'
      marker.style.font = '700 12px system-ui'
      marker.style.boxShadow = '0 8px 28px rgba(0,0,0,.32)'
      marker.style.pointerEvents = 'auto'
      layer.append(marker)
    }

    doc.body.append(layer)

    return () => {
      layer.remove()
    }
  }, [agentationEnabled, annotations, currentPreviewHtml])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    const frameWindow = iframe?.contentWindow
    if (!doc || !frameWindow || !agentationEnabled) return

    const handleClick = (event: MouseEvent) => {
      if (!annotationComment.trim()) {
        setAnnotationStatus('error')
        setAnnotationMessage('Add a comment')
        return
      }
      const target = event.target as Element | null
      if (!target || target.closest('[data-ship-fast-agentation-layer]')) return
      event.preventDefault()

      const rect = target.getBoundingClientRect()
      const annotation = {
        id: `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        x: event.clientX + frameWindow.scrollX,
        y: event.clientY + frameWindow.scrollY,
        comment: annotationComment.trim(),
        element: describeElement(target),
        elementPath: buildElementPath(target),
        timestamp: Date.now(),
        selectedText: frameWindow.getSelection()?.toString().trim() || undefined,
        nearbyText: (target.textContent || '').trim().slice(0, 240) || undefined,
        boundingBox: {
          x: rect.x + frameWindow.scrollX,
          y: rect.y + frameWindow.scrollY,
          width: rect.width,
          height: rect.height,
        },
        sessionId: agentation.agentationSessionId,
        url: window.location.href,
        status: 'pending',
        intent: 'change',
      }

      setAnnotationStatus('saving')
      setAnnotationMessage('')
      void saveGeneratedAnnotation({
        data: {
          sessionId,
          annotation,
        },
      })
        .then((state) => {
          setAnnotations(state.annotations)
          setAnnotationStatus('saved')
          setAnnotationMessage('Annotation saved')
          window.setTimeout(() => setAnnotationStatus('idle'), 1600)
        })
        .catch((error) => {
          setAnnotationStatus('error')
          setAnnotationMessage(error instanceof Error ? error.message : 'Annotation failed')
        })
    }

    doc.body.style.cursor = annotationComment.trim() ? 'crosshair' : ''
    doc.addEventListener('click', handleClick, true)

    return () => {
      doc.body.style.cursor = ''
      doc.removeEventListener('click', handleClick, true)
    }
  }, [agentation.agentationSessionId, agentationEnabled, annotationComment, currentPreviewHtml, sessionId])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc || !currentPreviewHtml) return

    const styles = selectedTheme ? resolveThemeStyles(selectedTheme) : null
    if (styles) {
      applyThemeVars(doc.documentElement, styles, isDark)
      injectThemeFonts(doc, styles)
    } else {
      for (const key of [
        'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
        'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
        'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring',
        'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'sidebar', 'sidebar-foreground',
        'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground',
        'sidebar-border', 'sidebar-ring', 'font-sans', 'font-serif', 'font-mono', 'radius',
        'shadow-color', 'shadow-opacity', 'shadow-blur', 'shadow-spread', 'shadow-offset-x', 'shadow-offset-y',
        'letter-spacing', 'spacing'
      ]) {
        doc.documentElement.style.removeProperty(`--${key}`)
      }
      doc.documentElement.classList.remove('dark')
      doc.documentElement.style.colorScheme = ''
    }
  }, [selectedTheme, isDark, currentPreviewHtml])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    const frameWindow = iframe?.contentWindow
    if (!doc || !frameWindow || !aiEditMode) return

    const handleSelectionChange = () => {
      const selection = frameWindow.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      const text = range.toString().trim()
      if (!text || text.length < 2 || text.length > 500) return

      const rect = range.getBoundingClientRect()
      setAiSelection({ text, rect })
    }

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 50)
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (iframe && !iframe.contains(target)) {
        setAiSelection(null)
      }
    }

    doc.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('click', handleClickOutside)

    return () => {
      doc.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('click', handleClickOutside)
      setAiSelection(null)
    }
  }, [aiEditMode, iframeRef])

  const handleSaveTextEdit = useCallback(async () => {
    const oldText = selectedText.trim()
    if (!oldText || replacementText === selectedText) return

    setSaveStatus('saving')
    setSaveMessage('')
    try {
      const result = await savePreviewTextEdit({
        data: {
          sessionId,
          oldText,
          newText: replacementText,
        },
      })
      if (result.saved && result.html) {
        setCurrentPreviewHtml(result.html)
        setSelectedText(replacementText)
        setSaveStatus('saved')
        setSaveMessage('Saved')
        void router.invalidate()
        window.setTimeout(() => setSaveStatus('idle'), 1800)
        return
      }
      setSaveStatus('error')
      setSaveMessage(result.reason === 'text-not-found' ? 'Text no longer exists' : 'Preview not ready')
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(error instanceof Error ? error.message : 'Save failed')
    }
  }, [replacementText, router, selectedText, sessionId])

  const handleRewriteText = useCallback(async () => {
    const text = selectedText.trim()
    const instruction = rewriteInstruction.trim()
    if (!text || !instruction) return

    setRewriteStatus('rewriting')
    setRewriteMessage('')
    try {
      const result = await rewritePreviewText({
        data: {
          text,
          instruction,
        },
      })
      setReplacementText(result.rewritten)
      setRewriteStatus('rewritten')
      setRewriteMessage('AI rewrite ready')
    } catch (error) {
      setRewriteStatus('error')
      setRewriteMessage(error instanceof Error ? error.message : 'AI rewrite failed')
    }
  }, [rewriteInstruction, selectedText])

  const handleAIRewriteSubmit = useCallback(async (instruction: string) => {
    if (!aiSelection) return

    setRewriteStatus('rewriting')
    setRewriteMessage('')
    try {
      const result = await rewritePreviewText({
        data: {
          text: aiSelection.text,
          instruction,
        },
      })
      if (result.rewritten) {
        const iframe = iframeRef.current
        const doc = iframe?.contentDocument
        if (doc) {
          const html = currentPreviewHtml.replace(aiSelection.text, result.rewritten)
          setCurrentPreviewHtml(html)
          setRewriteStatus('rewritten')
          setRewriteMessage('Rewritten')
          window.setTimeout(() => setRewriteStatus('idle'), 1800)
        }
        setAiSelection(null)
        return
      }
      setRewriteStatus('error')
      setRewriteMessage('Rewrite failed')
    } catch (error) {
      setRewriteStatus('error')
      setRewriteMessage(error instanceof Error ? error.message : 'Rewrite failed')
    }
  }, [aiSelection, currentPreviewHtml])

  const handleToggleAgentation = useCallback(async () => {
    const enabled = !agentationEnabled
    setAgentationEnabledState(enabled)
    setEditMode(false)
    setAnnotationStatus('saving')
    setAnnotationMessage('')
    try {
      const state = await setGeneratedAgentationEnabled({
        data: {
          sessionId,
          enabled,
        },
      })
      setAgentationEnabledState(state.enabled)
      setAnnotations(state.annotations)
      setAnnotationStatus('saved')
      setAnnotationMessage(state.enabled ? 'Annotations enabled' : 'Annotations disabled')
      window.setTimeout(() => setAnnotationStatus('idle'), 1600)
    } catch (error) {
      setAgentationEnabledState(!enabled)
      setAnnotationStatus('error')
      setAnnotationMessage(error instanceof Error ? error.message : 'Annotation toggle failed')
    }
  }, [agentationEnabled, sessionId])

  const handleDeleteAnnotation = useCallback(async (annotationId: string) => {
    setAnnotationStatus('saving')
    setAnnotationMessage('')
    try {
      const state = await deleteGeneratedAnnotation({
        data: {
          sessionId,
          annotationId,
        },
      })
      setAnnotations(state.annotations)
      setAnnotationStatus('saved')
      setAnnotationMessage('Annotation deleted')
      window.setTimeout(() => setAnnotationStatus('idle'), 1600)
    } catch (error) {
      setAnnotationStatus('error')
      setAnnotationMessage(error instanceof Error ? error.message : 'Delete failed')
    }
  }, [sessionId])

  const handleClearAnnotations = useCallback(async () => {
    setAnnotationStatus('saving')
    setAnnotationMessage('')
    try {
      const state = await clearGeneratedAnnotations({ data: { sessionId } })
      setAnnotations(state.annotations)
      setAnnotationStatus('saved')
      setAnnotationMessage('Annotations cleared')
      window.setTimeout(() => setAnnotationStatus('idle'), 1600)
    } catch (error) {
      setAnnotationStatus('error')
      setAnnotationMessage(error instanceof Error ? error.message : 'Clear failed')
    }
  }, [sessionId])

  const getStartAccess = useCallback(async (action: string) => {
    const authToken = await getStartClerkToken()
    const ownerSecret =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(`ship-fast:anon-owner:${sessionId}`) || ''
        : ''
    if (!authToken && !ownerSecret) {
      throw new Error(`${action} needs Clerk sign-in or the anonymous owner secret from the generating browser.`)
    }
    return { authToken, ownerSecret }
  }, [sessionId])

  const handleBuildExport = useCallback(async (target: string) => {
    setExportStatus('building')
    setExportMessage('')
    try {
      const state = await buildGeneratedExport({ data: { sessionId, target } })
      setExportTargets(state.targets)
      const builtTarget = state.targets.find((entry) => entry.target === target)
      setExportStatus('ready')
      setExportMessage(
        builtTarget?.ready
          ? `${target.toUpperCase()} export built with ${builtTarget.fileCount} files`
          : `${target.toUpperCase()} export requested`,
      )
    } catch (error) {
      setExportStatus('error')
      setExportMessage(error instanceof Error ? error.message : 'Export build failed')
    }
  }, [sessionId])

  const handleDownloadExport = useCallback(async (target: string) => {
    setExportStatus('downloading')
    setExportMessage('')
    try {
      const { authToken, ownerSecret } = await getStartAccess('Download')
      const response = await fetch(
        `/api/start/sessions/${encodeURIComponent(sessionId)}/download/${encodeURIComponent(target)}`,
        {
          headers: {
            ...(ownerSecret ? { 'x-ship-fast-owner-secret': ownerSecret } : {}),
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        },
      )
      if (!response.ok) {
        let message = `Download failed (${response.status})`
        try {
          const body = await response.json()
          if (body?.error) message = body.error
        } catch {
          /* fall back to status */
        }
        throw new Error(message)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = `${sessionId}-${target}.zip`
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setExportStatus('ready')
      setExportMessage(`${target.toUpperCase()} download started`)
    } catch (error) {
      setExportStatus('error')
      setExportMessage(error instanceof Error ? error.message : 'Download failed')
    }
  }, [getStartAccess, sessionId])

  const handleDeploy = useCallback(async () => {
    setDeployStatus('deploying')
    setDeployMessage('')
    try {
      const { authToken, ownerSecret } = await getStartAccess('Deploy')
      const state = await deployGeneratedSession({
        data: {
          sessionId,
          ownerSecret,
          authToken,
        },
      })
      setDeploymentState(state)
      setDeployStatus('deployed')
      setDeployMessage(state.deployment?.url ? 'Deployment ready' : 'Deployment created')
    } catch (error) {
      setDeployStatus('error')
      setDeployMessage(error instanceof Error ? error.message : 'Deploy failed')
    }
  }, [getStartAccess, sessionId])

  const handleGitHubPush = useCallback(async (target: string) => {
    const token = githubAccessToken.trim()
    if (!token) {
      setGithubStatus('error')
      setGithubMessage('GitHub access token is required for this push.')
      return
    }

    setGithubStatus('pushing')
    setGithubMessage('')
    try {
      const { authToken, ownerSecret } = await getStartAccess('GitHub push')
      const state = await pushGeneratedGitHub({
        data: {
          sessionId,
          target,
          ownerSecret,
          authToken,
          githubAccessToken: token,
        },
      })
      setGithubTargets(state.targets)
      setGithubStatus('pushed')
      setGithubMessage(state.result?.repoFullName ? `Pushed to ${state.result.repoFullName}` : 'GitHub push complete')
    } catch (error) {
      setGithubStatus('error')
      setGithubMessage(error instanceof Error ? error.message : 'GitHub push failed')
    }
  }, [getStartAccess, githubAccessToken, sessionId])

  const handleProvisionSanity = useCallback(async () => {
    setCmsStatus('provisioning')
    setCmsMessage('')
    try {
      const { authToken, ownerSecret } = await getStartAccess('Sanity provisioning')
      const state = await provisionGeneratedSanity({
        data: {
          sessionId,
          ownerSecret,
          authToken,
        },
      })
      setCmsState(state)
      setCmsStatus('ready')
      setCmsMessage(state.alreadyProvisioned ? 'Sanity already provisioned' : 'Sanity provisioned')
    } catch (error) {
      setCmsStatus('error')
      setCmsMessage(error instanceof Error ? error.message : 'Sanity provisioning failed')
    }
  }, [getStartAccess, sessionId])

  const handleProvisionMedusa = useCallback(async () => {
    setCmsStatus('provisioning')
    setCmsMessage('')
    try {
      const { authToken, ownerSecret } = await getStartAccess('Medusa provisioning')
      const state = await provisionGeneratedMedusa({
        data: {
          sessionId,
          ownerSecret,
          authToken,
        },
      })
      setCmsState(state)
      setCmsStatus('ready')
      const synced = state.sync?.synced
      setCmsMessage(
        state.alreadyProvisioned
          ? synced
            ? `Medusa already provisioned; synced ${synced} products`
            : 'Medusa already provisioned'
          : synced
            ? `Medusa provisioned; synced ${synced} products`
            : 'Medusa provisioned',
      )
    } catch (error) {
      setCmsStatus('error')
      setCmsMessage(error instanceof Error ? error.message : 'Medusa provisioning failed')
    }
  }, [getStartAccess, sessionId])

  if (!session || !readiness) {
    return (
      <main className="generate-workspace generate-empty">
        <GeneratedTopBar sessionId={sessionId} prompt={null} moduleCount={0} elapsed={null} />
        <section className="generate-missing">
          <p className="eyebrow">Session not found</p>
          <h1>This generation is not in the local Shipfast repository.</h1>
          <Link className="secondary-action" to="/">Back to Start shell</Link>
        </section>
      </main>
    )
  }

  const hasPreview = readiness.homepageReady || readiness.openuiReady
  const hasLocalPreview = Boolean(currentPreviewHtml || openuiSource)
  const hasOpenUI = Boolean(openuiSource)
  const elapsedLabel = typeof readiness.elapsed === 'number' ? `${readiness.elapsed.toFixed(1)}s` : 'Pending'
  const progressLabel = `${readiness.done}/${readiness.taskCount} tasks`

  return (
    <main className="generate-workspace">
      <GeneratedTopBar
        sessionId={session.id}
        prompt={session.prompt}
        moduleCount={readiness.taskCount}
        elapsed={readiness.elapsed}
      />

      <section className="generate-status-strip" aria-label="Generation status">
        <div>
          <span>Progress</span>
          <strong>{progressLabel}</strong>
        </div>
        <div>
          <span>OpenUI</span>
          <strong>{readiness.openuiReady ? 'Ready' : 'Pending'}</strong>
        </div>
        <div>
          <span>Homepage</span>
          <strong>{readiness.homepageReady ? 'Ready' : 'Pending'}</strong>
        </div>
        <div>
          <span>Elapsed</span>
          <strong>{elapsedLabel}</strong>
        </div>
      </section>

      <section className="generate-preview-shell" aria-label="Generated website preview">
        <TopBar
          id={sessionId}
          prompt={session.prompt}
          moduleCount={readiness.taskCount}
          elapsed={readiness.elapsed}
          themeName={selectedTheme}
          isDark={isDark}
          onSelectTheme={setSelectedTheme}
          onToggleMode={() => setIsDark((v) => !v)}
          editMode={editMode}
          onToggleEditMode={() => {
            setEditMode((value) => !value)
            setSaveStatus('idle')
            setSaveMessage('')
            setRewriteStatus('idle')
            setRewriteMessage('')
          }}
          aiEditMode={aiEditMode}
          onToggleAIEditMode={() => setAiEditMode((v) => !v)}
          agentationEnabled={agentationEnabled}
          agentationAnnotationCount={annotations.length}
          onToggleAgentation={handleToggleAgentation}
        />

        <div className="generate-preview-body">
        <div className="generate-preview-main">
        {hasPreview ? (
          <>
            {hasOpenUI ? (
              <DirectPreview
                ref={directPreviewRef}
                themeStyles={selectedTheme ? resolveThemeStyles(selectedTheme) : null}
                isDark={false}
              >
                <Renderer response={openuiSource} library={library} isStreaming={false} />
              </DirectPreview>
            ) : (
              <iframe
                ref={iframeRef}
                className="generate-preview-frame"
                title={`Preview for ${session.prompt || session.id}`}
                src={hasLocalPreview ? undefined : links.preview}
                srcDoc={hasLocalPreview ? currentPreviewHtml : undefined}
              />
            )}
          </>
        ) : null}

        {aiSelection && (
          <AIPromptBox
            text={aiSelection.text}
            rect={aiSelection.rect}
            onSubmit={handleAIRewriteSubmit}
            onCancel={() => setAiSelection(null)}
            isLoading={rewriteStatus === 'rewriting'}
          />
        )}

        {!hasPreview ? (
          <IntroLoader phase="compose" progress={readiness.taskCount} />
        ) : null}
        </div>

        <aside className="generate-panel">
        {editMode && hasLocalPreview ? (
          <form
            className="edit-toolbar"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSaveTextEdit()
            }}
          >
            <label>
              <span>Selected text</span>
              <textarea
                value={selectedText}
                onChange={(event) => {
                  setSelectedText(event.target.value)
                  setSaveStatus('idle')
                }}
                rows={2}
              />
            </label>
            <label>
              <span>Replacement</span>
              <textarea
                value={replacementText}
                onChange={(event) => {
                  setReplacementText(event.target.value)
                  setSaveStatus('idle')
                }}
                rows={2}
              />
            </label>
            <label>
              <span>AI instruction</span>
              <textarea
                value={rewriteInstruction}
                onChange={(event) => {
                  setRewriteInstruction(event.target.value)
                  setRewriteStatus('idle')
                  setRewriteMessage('')
                }}
                rows={2}
              />
            </label>
            <button
              type="button"
              className="secondary-action"
              disabled={!selectedText.trim() || !rewriteInstruction.trim() || rewriteStatus === 'rewriting'}
              onClick={() => void handleRewriteText()}
            >
              <Wand2 aria-hidden="true" />
              {rewriteStatus === 'rewriting' ? 'Rewriting' : 'AI rewrite'}
            </button>
            <button
              type="submit"
              className="primary-action"
              disabled={!selectedText.trim() || replacementText === selectedText || saveStatus === 'saving'}
            >
              {saveStatus === 'saved' ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
              {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Save edit'}
            </button>
            {saveMessage ? <span className={`edit-save-message ${saveStatus}`}>{saveMessage}</span> : null}
            {rewriteMessage ? <span className={`edit-save-message ${rewriteStatus}`}>{rewriteMessage}</span> : null}
          </form>
        ) : null}

        {agentationEnabled && hasLocalPreview ? (
          <section className="annotation-toolbar" aria-label="Agentation annotations">
            <div className="annotation-compose">
              <label>
                <span>Comment</span>
                <input
                  value={annotationComment}
                  onChange={(event) => {
                    setAnnotationComment(event.target.value)
                    setAnnotationStatus('idle')
                    setAnnotationMessage('')
                  }}
                  placeholder="Change this section..."
                />
              </label>
              <button
                type="button"
                className="secondary-action"
                disabled={annotations.length === 0 || annotationStatus === 'saving'}
                onClick={() => void handleClearAnnotations()}
              >
                Clear
              </button>
              {annotationMessage ? (
                <span className={`edit-save-message ${annotationStatus}`}>{annotationMessage}</span>
              ) : null}
            </div>
            {annotations.length ? (
              <ol className="annotation-list">
                {annotations.map((entry, index) => (
                  <li key={entry.annotationId}>
                    <span className="annotation-index">{index + 1}</span>
                    <div>
                      <strong>{entry.comment || 'Annotation'}</strong>
                      <span>{entry.element || entry.elementPath || entry.annotationId}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-action"
                      title="Delete annotation"
                      onClick={() => void handleDeleteAnnotation(entry.annotationId)}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ) : null}

        {hasLocalPreview ? (
          <section className="export-toolbar" aria-label="Export generated website">
            <div className="export-heading">
              <PackageCheck aria-hidden="true" />
              <div>
                <strong>Exports</strong>
                <span>
                  {exports?.authenticatedDownloadRequired
                    ? 'Sign in with Clerk to download this project.'
                    : 'Build and download from this Start workspace.'}
                </span>
              </div>
            </div>
            <div className="export-targets">
              {exportTargets.map((target) => (
                <div className="export-target" key={target.target}>
                  <div>
                    <strong>{target.target.toUpperCase()}</strong>
                    <span>{target.ready ? `${target.fileCount} files ready` : target.buildReason || 'Not built'}</span>
                  </div>
                  <button
                    type="button"
                    className="secondary-action"
                    disabled={exportStatus === 'building' || !target.buildReady}
                    onClick={() => void handleBuildExport(target.target)}
                  >
                    {exportStatus === 'building' ? 'Building' : target.ready ? 'Rebuild' : 'Build'}
                  </button>
                  <button
                    type="button"
                    className="primary-action"
                    disabled={!target.ready || exportStatus === 'downloading'}
                    onClick={() => void handleDownloadExport(target.target)}
                  >
                    <Download aria-hidden="true" />
                    Download
                  </button>
                </div>
              ))}
            </div>
            {exportMessage ? (
              <span className={`edit-save-message ${exportStatus === 'error' ? 'error' : 'saved'}`}>
                {exportMessage}
              </span>
            ) : null}
          </section>
        ) : null}

        {hasLocalPreview ? (
          <section className="deploy-toolbar" aria-label="Deploy generated website">
            <div className="export-heading">
              <Globe2 aria-hidden="true" />
              <div>
                <strong>Deploy</strong>
                <span>
                  {deploymentState?.deployment?.url
                    ? deploymentState.deployment.url
                    : deploymentState?.authenticatedDeployRequired
                      ? 'Sign in with Clerk to deploy this project.'
                      : 'Publish a compatibility URL backed by the existing Shipfast deployment map.'}
                </span>
              </div>
            </div>
            <div className="deploy-actions">
              <button
                type="button"
                className="primary-action"
                disabled={deployStatus === 'deploying' || Boolean(deploymentState?.deployed)}
                onClick={() => void handleDeploy()}
              >
                {deployStatus === 'deploying' ? 'Deploying' : deploymentState?.deployed ? 'Deployed' : 'Deploy'}
              </button>
              {deploymentState?.deployment?.url ? (
                <a className="secondary-action" href={deploymentState.deployment.url}>
                  <ExternalLink aria-hidden="true" />
                  Open deployed site
                </a>
              ) : null}
              {deployMessage ? (
                <span className={`edit-save-message ${deployStatus === 'error' ? 'error' : 'saved'}`}>
                  {deployMessage}
                </span>
              ) : null}
            </div>
          </section>
        ) : null}

        {hasLocalPreview ? (
          <section className="github-toolbar" aria-label="Push generated website to GitHub">
            <div className="export-heading">
              <GitBranch aria-hidden="true" />
              <div>
                <strong>GitHub</strong>
                <span>
                  {github?.authenticatedPushRequired
                    ? 'Sign in with Clerk to push this project.'
                    : 'Push an export through the existing Shipfast GitHub engine.'}
                </span>
              </div>
            </div>
            <label className="github-token-field">
              <span>Access token</span>
              <input
                type="password"
                value={githubAccessToken}
                onChange={(event) => {
                  setGithubAccessToken(event.target.value)
                  setGithubStatus('idle')
                  setGithubMessage('')
                }}
                placeholder="github_pat_..."
                autoComplete="off"
              />
            </label>
            <div className="export-targets">
              {githubTargets.map((target) => (
                <div className="export-target" key={target.target}>
                  <div>
                    <strong>{target.target.toUpperCase()}</strong>
                    <span>
                      {target.github?.repoFullName
                        ? `${target.github.repoFullName}${target.github.branch ? `:${target.github.branch}` : ''}`
                        : target.buildReady
                          ? 'Ready to push'
                          : target.buildReason || 'Not ready'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="primary-action"
                    disabled={githubStatus === 'pushing' || !target.buildReady}
                    onClick={() => void handleGitHubPush(target.target)}
                  >
                    <GitBranch aria-hidden="true" />
                    {githubStatus === 'pushing' ? 'Pushing' : target.github?.repoFullName ? 'Push again' : 'Push'}
                  </button>
                  {target.github?.repoUrl ? (
                    <a className="secondary-action" href={target.github.repoUrl}>
                      <ExternalLink aria-hidden="true" />
                      Repo
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
            {githubMessage ? (
              <span className={`edit-save-message ${githubStatus === 'error' ? 'error' : 'saved'}`}>
                {githubMessage}
              </span>
            ) : null}
          </section>
        ) : null}

        {hasLocalPreview ? (
          <section className="cms-toolbar" aria-label="Provision CMS integrations">
            <div className="export-heading">
              <Database aria-hidden="true" />
              <div>
                <strong>CMS</strong>
                <span>
                  {cmsState?.authenticatedProvisionRequired
                    ? 'Sign in with Clerk to provision this project.'
                    : 'Provision Sanity and Medusa through the existing Shipfast services.'}
                </span>
              </div>
            </div>
            <div className="cms-targets">
              <div className="cms-target">
                <Database aria-hidden="true" />
                <div>
                  <strong>Sanity</strong>
                  <span>
                    {cmsState?.sanity?.configured
                      ? `${cmsState.sanity.config?.projectId || 'Project'} / ${cmsState.sanity.config?.dataset || 'dataset'}`
                      : cmsState?.sanity?.provisionable
                        ? 'Ready to provision'
                        : 'Provisioning not configured'}
                  </span>
                </div>
                <button
                  type="button"
                  className="primary-action"
                  disabled={cmsStatus === 'provisioning'}
                  onClick={() => void handleProvisionSanity()}
                >
                  {cmsStatus === 'provisioning' ? 'Provisioning' : cmsState?.sanity?.configured ? 'Recheck' : 'Provision'}
                </button>
              </div>
              <div className="cms-target">
                <Boxes aria-hidden="true" />
                <div>
                  <strong>Medusa</strong>
                  <span>
                    {cmsState?.medusa?.configured
                      ? cmsState.medusa.config?.productsSyncedAt
                        ? `${cmsState.medusa.config?.productsSyncedCount || 0} products synced`
                        : 'Tenant ready; catalog sync pending'
                      : cmsState?.medusa?.provisionable
                        ? 'Ready to provision'
                        : 'Provisioning not configured'}
                  </span>
                </div>
                <button
                  type="button"
                  className="primary-action"
                  disabled={cmsStatus === 'provisioning'}
                  onClick={() => void handleProvisionMedusa()}
                >
                  {cmsStatus === 'provisioning' ? 'Provisioning' : cmsState?.medusa?.configured ? 'Sync' : 'Provision'}
                </button>
              </div>
            </div>
            {cmsMessage ? (
              <span className={`edit-save-message ${cmsStatus === 'error' ? 'error' : 'saved'}`}>
                {cmsMessage}
              </span>
            ) : null}
          </section>
        ) : null}

        </aside>
        </div>
      </section>
    </main>
  )
}

function GeneratedTopBar({
  sessionId,
  prompt,
  moduleCount,
  elapsed,
}: {
  sessionId: string
  prompt: string | null
  moduleCount: number
  elapsed: number | null
}) {
  return (
    <header className="generate-topbar" data-session-id={sessionId}>
      <div className="generate-topbar-left">
        <Link to="/" className="topbar-icon-link" title="Home" aria-label="Back home">
          <Home aria-hidden="true" />
        </Link>
        <span className="topbar-session-title" title={prompt || sessionId}>
          {prompt || sessionId}
        </span>
      </div>
      <div className="generate-topbar-right">
        <span>{moduleCount} modules</span>
        <span>{elapsed != null ? `${elapsed.toFixed(1)}s` : 'Running'}</span>
      </div>
    </header>
  )
}

function describeElement(element: Element) {
  const tagName = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  const ariaLabel = element.getAttribute('aria-label')
  const text = (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
  if (ariaLabel) return `${tagName} "${ariaLabel}"`
  if (role) return `${tagName}[role="${role}"]${text ? ` "${text}"` : ''}`
  return `${tagName}${text ? ` "${text}"` : ''}`
}

function buildElementPath(element: Element) {
  const parts = []
  let current: Element | null = element
  while (current && current.tagName && parts.length < 8) {
    const tagName = current.tagName.toLowerCase()
    const id = current.id ? `#${current.id}` : ''
    const className = String(current.getAttribute('class') || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => `.${name.replace(/[^a-zA-Z0-9_-]/g, '')}`)
      .join('')
    parts.unshift(`${tagName}${id}${className}`)
    current = current.parentElement
  }
  return parts.join(' > ')
}


