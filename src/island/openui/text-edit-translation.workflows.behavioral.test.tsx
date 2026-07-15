// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InlineEditToolbar } from '@/features/editing/components/InlineEditToolbar'
import { useTextEdit } from '@/features/editing/hooks/useTextEdit'
import { I18nProvider, T } from './_providers/translation'

async function noBrowserTranslation(): Promise<null> {
  return null
}

vi.mock('./_providers/chrome-translator', function mockChromeTranslator() {
  return {
    translateOnDeviceBatch: vi.fn(noBrowserTranslation),
  }
})

// In-memory IndexedDB (idb-keyval) mock. The real translation cache persists
// to IndexedDB; jsdom has no IndexedDB, so we back idb-keyval with a Map.
// Individual tests can override get/set to reject to exercise the
// storage-failure fallback paths.
const idbMock = vi.hoisted(() => {
  const store = new Map<string, unknown>()

  function defaultGet(key: string): Promise<unknown> {
    return Promise.resolve(store.get(key) ?? undefined)
  }
  function defaultSet(key: string, value: unknown): Promise<void> {
    store.set(key, value)
    return Promise.resolve()
  }
  function defaultDel(key: string): Promise<void> {
    store.delete(key)
    return Promise.resolve()
  }
  function defaultClear(): Promise<void> {
    store.clear()
    return Promise.resolve()
  }
  function defaultCreateStore(): unknown {
    return {}
  }

  return {
    store,
    get: vi.fn(defaultGet),
    set: vi.fn(defaultSet),
    del: vi.fn(defaultDel),
    clear: vi.fn(defaultClear),
    createStore: vi.fn(defaultCreateStore),
    defaults: { defaultGet, defaultSet, defaultDel, defaultClear },
  }
})

vi.mock('idb-keyval', () => ({
  get: idbMock.get,
  set: idbMock.set,
  del: idbMock.del,
  clear: idbMock.clear,
  createStore: idbMock.createStore,
}))

type TestLocale = 'en' | 'fr' | 'hi'
type TextChangeHandler = Parameters<typeof useTextEdit>[2]
type TextChange = Parameters<TextChangeHandler>[0]

interface WorkflowHarnessProps {
  duplicateSource: boolean
  initialLocale: TestLocale
  onTextChange: TextChangeHandler
  sourceText: string
}

interface EditablePreviewProps {
  duplicateSource: boolean
  locale: TestLocale
  onTextChange: TextChangeHandler
  sourceText: string
}

interface ImeToolbarHarnessProps {
  onTextChange: TextChangeHandler
  onToolbarClose: () => void
  sourceText: string
}

const hindiBySource: Record<string, string> = {
  'After-switch source headline': 'स्विच के बाद स्रोत शीर्षक',
  'Escape source headline': 'एस्केप स्रोत शीर्षक',
  'Toolbar source headline': 'टूलबार स्रोत शीर्षक',
  'Outside source headline': 'बाहरी स्रोत शीर्षक',
  'Locale-switch source headline': 'लोकेल स्विच स्रोत शीर्षक',
  'Escape-after-switch source': 'स्विच के बाद एस्केप स्रोत',
  'Toolbar-after-switch source': 'स्विच के बाद टूलबार स्रोत',
  'Outside-after-switch source': 'स्विच के बाद बाहरी स्रोत',
  'Inflight draft source': 'प्रगति में ड्राफ्ट स्रोत',
  'Stale translation source': 'पुराना अनुवाद स्रोत',
  'Unmount source headline': 'अनमाउंट स्रोत शीर्षक',
  'Reload source headline': 'रीलोड स्रोत शीर्षक',
  'Saved source headline': 'सहेजा गया स्रोत शीर्षक',
  'Storage read failure source': 'स्टोरेज पढ़ने की विफलता स्रोत',
  'Storage quota source': 'स्टोरेज कोटा स्रोत',
  'Malformed cache source': 'दूषित कैश स्रोत',
  'Fetch rejection source': 'फ़ेच अस्वीकृति स्रोत',
  'Fetch abort source': 'फ़ेच निरस्त स्रोत',
  'Duplicate active source': 'डुप्लिकेट सक्रिय स्रोत',
  'Rapid locale source': 'तेज़ लोकेल स्रोत',
  'IME source headline': 'आईएमई स्रोत शीर्षक',
  'Cart 1': 'कार्ट 1',
  'Cart 2': 'कार्ट 2',
  'Open menu': 'मेनू खोलें',
  'Account menu': 'खाता मेनू',
  Checkout: 'चेकआउट',
}

const frenchBySource: Record<string, string> = {
  'Rapid locale source': 'Source de changement rapide',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function requestBody(init?: RequestInit): Record<string, unknown> {
  const parsed: unknown = JSON.parse(String(init?.body ?? '{}'))
  if (!isRecord(parsed)) {
    throw new Error('Translation request body was not an object')
  }
  return parsed
}

function requestTexts(init?: RequestInit): string[] {
  const texts = requestBody(init).texts
  if (!Array.isArray(texts) || !texts.every(isString)) {
    throw new Error('Translation request did not contain string texts')
  }
  return texts
}

function translatedResponse(texts: string[], locale: string): Response {
  function translateText(text: string): string {
    if (locale === 'hi') return hindiBySource[text] ?? text
    if (locale === 'fr') return frenchBySource[text] ?? text
    return text
  }

  return new Response(
    JSON.stringify({ translations: texts.map(translateText) }),
    {
      headers: { 'content-type': 'application/json' },
      status: 200,
    },
  )
}

async function fetchTranslations(
  _input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const body = requestBody(init)
  const locale = typeof body.locale === 'string' ? body.locale : ''
  return translatedResponse(requestTexts(init), locale)
}

function createDeferredTranslation(sourceText: string) {
  let markStarted: (() => void) | undefined
  let resolveResponse: ((response: Response) => void) | undefined
  let requestedTexts: string[] = []
  const started = new Promise<void>(function registerStarted(resolveStarted) {
    markStarted = resolveStarted
  })

  async function fetchDeferredTranslation(
    _input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const body = requestBody(init)
    const locale = typeof body.locale === 'string' ? body.locale : ''
    const texts = requestTexts(init)
    if (locale === 'hi' && texts.includes(sourceText)) {
      requestedTexts = texts
      if (markStarted) markStarted()
      return await new Promise<Response>(function registerResponse(
        resolveDeferredResponse,
      ) {
        resolveResponse = resolveDeferredResponse
      })
    }
    return translatedResponse(texts, locale)
  }

  function resolveTranslation(): void {
    if (!resolveResponse) {
      throw new Error('Deferred translation request did not start')
    }
    resolveResponse(translatedResponse(requestedTexts, 'hi'))
  }

  return {
    fetch: vi.fn(fetchDeferredTranslation),
    resolve: resolveTranslation,
    started,
  }
}

function createDeferredTranslationFailure(error: Error) {
  let markStarted: (() => void) | undefined
  let rejectResponse: ((reason: Error) => void) | undefined
  const started = new Promise<void>(function registerStarted(resolveStarted) {
    markStarted = resolveStarted
  })

  async function fetchFailingTranslation(
    _input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    requestTexts(init)
    if (markStarted) markStarted()
    return await new Promise<Response>(function registerFailure(
      _resolve,
      rejectDeferredResponse,
    ) {
      rejectResponse = rejectDeferredResponse
    })
  }

  function rejectTranslation(): void {
    if (!rejectResponse) {
      throw new Error('Deferred failing translation request did not start')
    }
    rejectResponse(error)
  }

  return {
    fetch: vi.fn(fetchFailingTranslation),
    reject: rejectTranslation,
    started,
  }
}

function scheduleAnimationFrame(callback: FrameRequestCallback): number {
  return window.setTimeout(function runFrame() {
    callback(0)
  }, 0)
}

function cancelAnimationFrameTimer(handle: number): void {
  window.clearTimeout(handle)
}

function EditablePreview({
  duplicateSource,
  locale,
  onTextChange,
  sourceText,
}: EditablePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { cancelEdit } = useTextEdit(previewRef, true, onTextChange)

  return (
    <div>
      <button data-testid="toolbar-close" onClick={cancelEdit}>
        Close edit
      </button>
      <div ref={previewRef} className="genui-preview">
        <I18nProvider locale={locale}>
          <T>
            <section>
              <h2 data-testid="editable-headline">{sourceText}</h2>
              {duplicateSource ? (
                <h2 data-testid="peer-headline">{sourceText}</h2>
              ) : null}
              <p>Stable preview sibling</p>
            </section>
          </T>
        </I18nProvider>
      </div>
    </div>
  )
}

function WorkflowHarness({
  duplicateSource,
  initialLocale,
  onTextChange,
  sourceText,
}: WorkflowHarnessProps) {
  const [locale, setLocale] = useState<TestLocale>(initialLocale)
  const [mounted, setMounted] = useState(true)
  const [revision, setRevision] = useState(0)
  const [savedHindiText, setSavedHindiText] = useState<string | null>(null)

  function switchToEnglish(): void {
    setLocale('en')
  }

  function switchToHindi(): void {
    setLocale('hi')
  }

  function switchToFrench(): void {
    setLocale('fr')
  }

  function unmountPreview(): void {
    setMounted(false)
  }

  function mountPreview(): void {
    setMounted(true)
  }

  function reloadPreview(): void {
    setRevision(function nextRevision(current) {
      return current + 1
    })
  }

  function handleTextChange(change: TextChange): void {
    onTextChange(change)
    if (locale === 'hi') {
      setSavedHindiText(change.newText)
    }
  }

  const visibleSource =
    locale === 'hi' && savedHindiText ? savedHindiText : sourceText

  return (
    <div>
      <div aria-label="Preview controls">
        <button data-testid="locale-en" onClick={switchToEnglish}>
          English
        </button>
        <button data-testid="locale-hi" onClick={switchToHindi}>
          Hindi
        </button>
        <button data-testid="locale-fr" onClick={switchToFrench}>
          French
        </button>
        <button data-testid="outside-control">Outside preview</button>
        <button data-testid="reload-preview" onClick={reloadPreview}>
          Reload preview
        </button>
        <button data-testid="unmount-preview" onClick={unmountPreview}>
          Unmount preview
        </button>
        <button data-testid="mount-preview" onClick={mountPreview}>
          Mount preview
        </button>
      </div>

      {mounted ? (
        <EditablePreview
          key={revision}
          duplicateSource={duplicateSource}
          locale={locale}
          onTextChange={handleTextChange}
          sourceText={visibleSource}
        />
      ) : (
        <div data-testid="preview-unmounted">Preview unmounted</div>
      )}
    </div>
  )
}

function renderWorkflow(
  sourceText: string,
  initialLocale: TestLocale,
  onTextChange: TextChangeHandler,
  duplicateSource = false,
) {
  return render(
    <WorkflowHarness
      duplicateSource={duplicateSource}
      initialLocale={initialLocale}
      onTextChange={onTextChange}
      sourceText={sourceText}
    />,
  )
}

function ignoreToolbarAction(): void {}

function ImeToolbarHarness({
  onTextChange,
  onToolbarClose,
  sourceText,
}: ImeToolbarHarnessProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  function handleActivate(element: HTMLElement, rect: DOMRect): void {
    setActiveElement(element)
    setAnchorRect(rect)
  }

  const { cancelEdit } = useTextEdit(
    previewRef,
    true,
    onTextChange,
    undefined,
    handleActivate,
  )

  function handleToolbarClose(): void {
    onToolbarClose()
    cancelEdit()
    setActiveElement(null)
    setAnchorRect(null)
  }

  return (
    <div>
      <div ref={previewRef} className="genui-preview">
        <I18nProvider locale="hi">
          <T>
            <h2 data-testid="editable-headline">{sourceText}</h2>
          </T>
        </I18nProvider>
      </div>
      {activeElement && anchorRect ? (
        <InlineEditToolbar
          activeElement={activeElement}
          anchorRect={anchorRect}
          isOpen
          onClose={handleToolbarClose}
          onCommitText={ignoreToolbarAction}
          onStyleApply={ignoreToolbarAction}
        />
      ) : null}
    </div>
  )
}

function StatefulInteractivePreview() {
  const [count, setCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  function incrementCart(): void {
    setCount(function nextCount(current) {
      return current + 1
    })
  }

  function openMenu(): void {
    setMenuOpen(true)
  }

  return (
    <section data-testid="interactive-subtree">
      <button
        aria-label={`Cart ${count}`}
        data-testid="cart-counter"
        onClick={incrementCart}
      >
        {`Cart ${count}`}
      </button>
      <button aria-label="Open menu" data-testid="open-menu" onClick={openMenu}>
        Open menu
      </button>
      {menuOpen ? (
        <div aria-label="Account menu" data-testid="account-menu" role="dialog">
          <h3>Account menu</h3>
          <button aria-label="Checkout" data-testid="checkout-action">
            Checkout
          </button>
        </div>
      ) : null}
    </section>
  )
}

function StatePreservationPreview({ locale }: { locale: TestLocale }) {
  return (
    <I18nProvider locale={locale}>
      <T>
        <StatefulInteractivePreview />
      </T>
    </I18nProvider>
  )
}

function headline(): HTMLElement {
  return screen.getByTestId('editable-headline')
}

function peerHeadline(): HTMLElement {
  return screen.getByTestId('peer-headline')
}

function headlineTextNode(element: HTMLElement): Text {
  const node = element.firstChild
  if (!(node instanceof Text)) {
    throw new Error('Editable headline did not contain a text node')
  }
  return node
}

function activateHeadline(): HTMLElement {
  const element = headline()
  const click = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
  })
  act(function dispatchActivationClick() {
    element.dispatchEvent(click)
  })
  expect(click.defaultPrevented).toBe(true)
  expect(headline()).toBe(element)
  expect(element.style.cursor).toBe('text')
  expect(element.contentEditable).toBe('true')
  expect(element.dataset.shipFastInlineEditing).toBe('true')
  return element
}

function replaceDraft(element: HTMLElement, draft: string): void {
  const node = headlineTextNode(element)
  act(function updateDraft() {
    node.nodeValue = draft
  })
  expect(element.textContent).toBe(draft)
}

async function expectHeadlineText(expectedText: string): Promise<void> {
  await waitFor(function checkHeadlineText() {
    expect(headline().textContent).toBe(expectedText)
  })
}

function expectInactiveHeadline(expectedText: string): void {
  const element = headline()
  expect({
    contentEditable: element.getAttribute('contenteditable'),
    editing: element.dataset.shipFastInlineEditing,
    text: element.textContent,
  }).toEqual({
    contentEditable: null,
    editing: undefined,
    text: expectedText,
  })
}

async function blurToOutside(element: HTMLElement): Promise<void> {
  const outside = screen.getByTestId('outside-control')
  act(function focusOutside() {
    outside.focus()
  })
  fireEvent.blur(element, { relatedTarget: outside })
  await act(async function flushBlurFrame() {
    await new Promise(function waitForFrame(resolve) {
      window.setTimeout(resolve, 0)
    })
  })
}

async function flushTranslation(): Promise<void> {
  await act(async function flushTranslationWork() {
    await new Promise(function waitForFirstFlush(resolve) {
      window.setTimeout(resolve, 0)
    })
    await new Promise(function waitForMutationFlush(resolve) {
      window.setTimeout(resolve, 70)
    })
  })
}

describe('preview text editing across locale transitions', function previewTextEditingSuite() {
  beforeEach(function setupBrowserMocks() {
    window.localStorage.clear()
    idbMock.store.clear()
    idbMock.get.mockImplementation(idbMock.defaults.defaultGet)
    idbMock.set.mockImplementation(idbMock.defaults.defaultSet)
    idbMock.del.mockImplementation(idbMock.defaults.defaultDel)
    idbMock.clear.mockImplementation(idbMock.defaults.defaultClear)
    vi.stubGlobal('fetch', vi.fn(fetchTranslations))
    vi.stubGlobal('requestAnimationFrame', scheduleAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameTimer)
  })

  afterEach(function cleanupBrowserMocks() {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('edits translated preview text after a locale switch and restores that locale on Escape', async function editAfterLocaleSwitch() {
    const onTextChange = vi.fn()
    renderWorkflow('After-switch source headline', 'en', onTextChange)

    fireEvent.click(screen.getByTestId('locale-hi'))
    await expectHeadlineText('स्विच के बाद स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'स्विच के बाद अधूरा ड्राफ्ट')
    fireEvent.keyDown(element, { key: 'Escape' })

    expectInactiveHeadline('स्विच के बाद स्रोत शीर्षक')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('restores translated text when Escape cancels an active localized draft', async function escapeLocalizedDraft() {
    const onTextChange = vi.fn()
    renderWorkflow('Escape source headline', 'hi', onTextChange)
    await expectHeadlineText('एस्केप स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'एस्केप अधूरा ड्राफ्ट')
    fireEvent.keyDown(element, { key: 'Escape' })

    expectInactiveHeadline('एस्केप स्रोत शीर्षक')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('restores translated text when the toolbar X cancels an active localized draft', async function toolbarCancelsLocalizedDraft() {
    const onTextChange = vi.fn()
    renderWorkflow('Toolbar source headline', 'hi', onTextChange)
    await expectHeadlineText('टूलबार स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'टूलबार अधूरा ड्राफ्ट')
    fireEvent.click(screen.getByTestId('toolbar-close'))

    expectInactiveHeadline('टूलबार स्रोत शीर्षक')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('commits one localized change when focus genuinely leaves the preview', async function outsideBlurCommitsOnce() {
    const onTextChange = vi.fn()
    renderWorkflow('Outside source headline', 'hi', onTextChange)
    await expectHeadlineText('बाहरी स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'बाहरी सहेजा गया ड्राफ्ट')
    await blurToOutside(element)

    expectInactiveHeadline('बाहरी सहेजा गया ड्राफ्ट')
    expect(onTextChange).toHaveBeenCalledTimes(1)
    expect(onTextChange).toHaveBeenCalledWith(
      expect.objectContaining({
        newText: 'बाहरी सहेजा गया ड्राफ्ट',
        oldText: 'बाहरी स्रोत शीर्षक',
      }),
    )
  })

  it('terminates and discards an active localized draft as soon as locale changes', async function localeSwitchCancelsDraft() {
    const onTextChange = vi.fn()
    renderWorkflow('Locale-switch source headline', 'hi', onTextChange)
    await expectHeadlineText('लोकेल स्विच स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'गलत अंग्रेज़ी ड्राफ्ट रिसाव')
    fireEvent.click(screen.getByTestId('locale-en'))

    await waitFor(function checkLocaleSwitchCleanup() {
      expectInactiveHeadline('Locale-switch source headline')
    })
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it.each([
    ['Escape', 'escape'],
    ['toolbar X', 'toolbar'],
    ['outside blur', 'outside'],
  ])(
    'never restores a previous-locale draft after switching locale and then using %s',
    async function cancellationAfterLocaleSwitch(_label, trigger) {
      const sourceByTrigger: Record<string, string> = {
        escape: 'Escape-after-switch source',
        outside: 'Outside-after-switch source',
        toolbar: 'Toolbar-after-switch source',
      }
      const hindiByTrigger: Record<string, string> = {
        escape: 'स्विच के बाद एस्केप स्रोत',
        outside: 'स्विच के बाद बाहरी स्रोत',
        toolbar: 'स्विच के बाद टूलबार स्रोत',
      }
      const sourceText = sourceByTrigger[trigger]
      const hindiText = hindiByTrigger[trigger]
      if (!sourceText || !hindiText) {
        throw new Error(`Unknown cancellation trigger: ${trigger}`)
      }

      const onTextChange = vi.fn()
      renderWorkflow(sourceText, 'hi', onTextChange)
      await expectHeadlineText(hindiText)

      const element = activateHeadline()
      replaceDraft(element, `अधूरा ${trigger} ड्राफ्ट`)
      fireEvent.click(screen.getByTestId('locale-en'))

      if (trigger === 'escape') {
        fireEvent.keyDown(element, { key: 'Escape' })
      } else if (trigger === 'toolbar') {
        fireEvent.click(screen.getByTestId('toolbar-close'))
      } else {
        await blurToOutside(element)
      }

      await waitFor(function checkNewLocaleSource() {
        expectInactiveHeadline(sourceText)
      })
      expect(onTextChange).not.toHaveBeenCalled()
    },
  )

  it('keeps an active draft safe from an in-flight translation and restores the localized source on X', async function inflightTranslationRespectsDraft() {
    const sourceText = 'Inflight draft source'
    const deferred = createDeferredTranslation(sourceText)
    vi.stubGlobal('fetch', deferred.fetch)
    const onTextChange = vi.fn()
    renderWorkflow(sourceText, 'hi', onTextChange)
    await deferred.started

    const element = activateHeadline()
    replaceDraft(element, 'प्रगति में सुरक्षित ड्राफ्ट')
    deferred.resolve()
    await flushTranslation()

    expect(element.textContent).toBe('प्रगति में सुरक्षित ड्राफ्ट')
    expect(element.contentEditable).toBe('true')

    fireEvent.click(screen.getByTestId('toolbar-close'))
    await expectHeadlineText('प्रगति में ड्राफ्ट स्रोत')
    expectInactiveHeadline('प्रगति में ड्राफ्ट स्रोत')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('ignores a stale translation completion after locale changes during an active draft', async function staleTranslationCannotLeak() {
    const sourceText = 'Stale translation source'
    const deferred = createDeferredTranslation(sourceText)
    vi.stubGlobal('fetch', deferred.fetch)
    const onTextChange = vi.fn()
    renderWorkflow(sourceText, 'hi', onTextChange)
    await deferred.started

    const element = activateHeadline()
    replaceDraft(element, 'पुराना अधूरा ड्राफ्ट')
    fireEvent.click(screen.getByTestId('locale-en'))
    deferred.resolve()
    await flushTranslation()

    expectInactiveHeadline(sourceText)
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('discards an active draft when the preview component unmounts and reloads cleanly', async function unmountCancelsDraft() {
    const onTextChange = vi.fn()
    renderWorkflow('Unmount source headline', 'hi', onTextChange)
    await expectHeadlineText('अनमाउंट स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'अनमाउंट अधूरा ड्राफ्ट')
    fireEvent.click(screen.getByTestId('unmount-preview'))
    expect(screen.getByTestId('preview-unmounted')).toBeTruthy()
    expect(onTextChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('mount-preview'))
    await expectHeadlineText('अनमाउंट स्रोत शीर्षक')
    expectInactiveHeadline('अनमाउंट स्रोत शीर्षक')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('discards an active draft when the preview reloads in place', async function reloadCancelsDraft() {
    const onTextChange = vi.fn()
    renderWorkflow('Reload source headline', 'hi', onTextChange)
    await expectHeadlineText('रीलोड स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'रीलोड अधूरा ड्राफ्ट')
    fireEvent.click(screen.getByTestId('reload-preview'))

    await expectHeadlineText('रीलोड स्रोत शीर्षक')
    expectInactiveHeadline('रीलोड स्रोत शीर्षक')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('shows canonical English and the saved Hindi edit when switching back and forth after save', async function savedEditSurvivesLocaleRoundTrip() {
    const onTextChange = vi.fn()
    renderWorkflow('Saved source headline', 'hi', onTextChange)
    await expectHeadlineText('सहेजा गया स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'सहेजा गया अंतिम हिंदी शीर्षक')
    fireEvent.keyDown(element, { key: 'Enter' })
    expect(onTextChange).toHaveBeenCalledTimes(1)
    expectInactiveHeadline('सहेजा गया अंतिम हिंदी शीर्षक')

    fireEvent.click(screen.getByTestId('locale-en'))
    await expectHeadlineText('Saved source headline')
    expectInactiveHeadline('Saved source headline')

    fireEvent.click(screen.getByTestId('locale-hi'))
    await expectHeadlineText('सहेजा गया अंतिम हिंदी शीर्षक')
    expectInactiveHeadline('सहेजा गया अंतिम हिंदी शीर्षक')
    expect(onTextChange).toHaveBeenCalledTimes(1)
  })

  it('keeps translation usable when IndexedDB reads throw', async function storageReadFailureFallsBackToNetwork() {
    const fetchMock = vi.fn(fetchTranslations)
    vi.stubGlobal('fetch', fetchMock)
    idbMock.get.mockRejectedValue(
      new DOMException('IndexedDB blocked', 'SecurityError'),
    )
    const onTextChange = vi.fn()
    renderWorkflow('Storage read failure source', 'hi', onTextChange)

    await expectHeadlineText('स्टोरेज पढ़ने की विफलता स्रोत')
    expect(fetchMock).toHaveBeenCalled()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('keeps the translated result visible when IndexedDB writes exceed quota', async function storageQuotaDoesNotBreakTranslation() {
    const fetchMock = vi.fn(fetchTranslations)
    vi.stubGlobal('fetch', fetchMock)
    idbMock.set.mockRejectedValue(
      new DOMException('Storage quota exceeded', 'QuotaExceededError'),
    )
    const onTextChange = vi.fn()
    renderWorkflow('Storage quota source', 'hi', onTextChange)

    await expectHeadlineText('स्टोरेज कोटा स्रोत')
    expect(fetchMock).toHaveBeenCalled()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('ignores an empty malformed cached translation and repairs it from the network', async function malformedCacheFallsBackToNetwork() {
    const sourceText = 'Malformed cache source'
    idbMock.store.set(`hi\n${sourceText}`, '')
    const fetchMock = vi.fn(fetchTranslations)
    vi.stubGlobal('fetch', fetchMock)
    const onTextChange = vi.fn()
    renderWorkflow(sourceText, 'hi', onTextChange)

    await expectHeadlineText('दूषित कैश स्रोत')
    expect(fetchMock).toHaveBeenCalled()
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it.each([
    {
      error: new Error('Translation service rejected'),
      sourceText: 'Fetch rejection source',
      transition: 'rejects',
    },
    {
      error: new DOMException('Translation request aborted', 'AbortError'),
      sourceText: 'Fetch abort source',
      transition: 'aborts',
    },
  ])(
    'restores English when a locale request $transition after switching back',
    async function failedFetchCannotLeak({ error, sourceText }) {
      const deferred = createDeferredTranslationFailure(error)
      vi.stubGlobal('fetch', deferred.fetch)
      const onTextChange = vi.fn()
      renderWorkflow(sourceText, 'en', onTextChange)

      fireEvent.click(screen.getByTestId('locale-hi'))
      await deferred.started
      fireEvent.click(screen.getByTestId('locale-en'))
      deferred.reject()
      await flushTranslation()

      expectInactiveHeadline(sourceText)
      expect(onTextChange).not.toHaveBeenCalled()
    },
  )

  it('translates an identical peer while preserving the only actively edited text node', async function duplicateTextOnlyProtectsActiveNode() {
    const sourceText = 'Duplicate active source'
    const deferred = createDeferredTranslation(sourceText)
    vi.stubGlobal('fetch', deferred.fetch)
    const onTextChange = vi.fn()
    renderWorkflow(sourceText, 'en', onTextChange, true)

    const element = activateHeadline()
    replaceDraft(element, 'केवल सक्रिय डुप्लिकेट ड्राफ्ट')
    fireEvent.click(screen.getByTestId('locale-hi'))
    await deferred.started
    deferred.resolve()
    await flushTranslation()

    expect(element.textContent).toBe('केवल सक्रिय डुप्लिकेट ड्राफ्ट')
    expect(element.contentEditable).toBe('true')
    expect(peerHeadline().textContent).toBe('डुप्लिकेट सक्रिय स्रोत')

    fireEvent.click(screen.getByTestId('toolbar-close'))
    await expectHeadlineText('डुप्लिकेट सक्रिय स्रोत')
    expect(peerHeadline().textContent).toBe('डुप्लिकेट सक्रिय स्रोत')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('keeps canonical English after rapid hi to fr to en switches and a late Hindi response', async function rapidLocaleSwitchIgnoresLateResponse() {
    const sourceText = 'Rapid locale source'
    const deferred = createDeferredTranslation(sourceText)
    vi.stubGlobal('fetch', deferred.fetch)
    const onTextChange = vi.fn()
    renderWorkflow(sourceText, 'en', onTextChange)

    fireEvent.click(screen.getByTestId('locale-hi'))
    await deferred.started
    fireEvent.click(screen.getByTestId('locale-fr'))
    fireEvent.click(screen.getByTestId('locale-en'))
    deferred.resolve()
    await flushTranslation()

    expectInactiveHeadline(sourceText)
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('does not let toolbar Escape cancel a translated draft during IME composition', async function imeEscapeDoesNotCloseToolbar() {
    const onTextChange = vi.fn()
    const onToolbarClose = vi.fn()
    render(
      <ImeToolbarHarness
        onTextChange={onTextChange}
        onToolbarClose={onToolbarClose}
        sourceText="IME source headline"
      />,
    )
    await expectHeadlineText('आईएमई स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'आईएमई अधूरा ड्राफ्ट')
    fireEvent.compositionStart(element)
    fireEvent.keyDown(element, {
      isComposing: true,
      key: 'Escape',
      keyCode: 229,
      which: 229,
    })

    expect(onToolbarClose).not.toHaveBeenCalled()
    expect(element.contentEditable).toBe('true')
    expect(element.textContent).toBe('आईएमई अधूरा ड्राफ्ट')
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('lets toolbar Escape cancel exactly once after IME composition ends', async function escapeAfterImeCancelsOnce() {
    const onTextChange = vi.fn()
    const onToolbarClose = vi.fn()
    render(
      <ImeToolbarHarness
        onTextChange={onTextChange}
        onToolbarClose={onToolbarClose}
        sourceText="IME source headline"
      />,
    )
    await expectHeadlineText('आईएमई स्रोत शीर्षक')

    const element = activateHeadline()
    replaceDraft(element, 'आईएमई समाप्त ड्राफ्ट')
    fireEvent.compositionStart(element)
    fireEvent.compositionEnd(element)
    fireEvent.keyDown(element, { key: 'Escape', keyCode: 27, which: 27 })

    expectInactiveHeadline('आईएमई स्रोत शीर्षक')
    expect(onToolbarClose).toHaveBeenCalledTimes(1)
    expect(onTextChange).not.toHaveBeenCalled()
  })

  it('preserves interactive child state, dialog identity, focus, and current labels across locale rerenders', async function localeRerenderPreservesInteractiveState() {
    const rendered = render(<StatePreservationPreview locale="en" />)
    const subtree = screen.getByTestId('interactive-subtree')
    const counter = screen.getByTestId('cart-counter')

    fireEvent.click(counter)
    expect(counter.textContent).toBe('Cart 1')
    fireEvent.click(screen.getByTestId('open-menu'))

    const dialog = screen.getByRole('dialog', { name: 'Account menu' })
    const checkout = screen.getByRole('button', { name: 'Checkout' })
    checkout.focus()
    expect(document.activeElement).toBe(checkout)

    rendered.rerender(<StatePreservationPreview locale="hi" />)
    await waitFor(function checkHindiInteractiveState() {
      expect(counter.textContent).toBe('कार्ट 1')
      expect(counter.getAttribute('aria-label')).toBe('कार्ट 1')
      expect(dialog.getAttribute('aria-label')).toBe('खाता मेनू')
      expect(checkout.textContent).toBe('चेकआउट')
      expect(checkout.getAttribute('aria-label')).toBe('चेकआउट')
    })

    expect(screen.getByTestId('interactive-subtree')).toBe(subtree)
    expect(screen.getByTestId('cart-counter')).toBe(counter)
    expect(screen.getByTestId('account-menu')).toBe(dialog)
    expect(document.activeElement).toBe(checkout)

    fireEvent.click(counter)
    await waitFor(function checkTranslatedIncrement() {
      expect(counter.textContent).toBe('कार्ट 2')
      expect(counter.getAttribute('aria-label')).toBe('कार्ट 2')
    })

    rendered.rerender(<StatePreservationPreview locale="en" />)
    await waitFor(function checkEnglishInteractiveState() {
      expect(counter.textContent).toBe('Cart 2')
      expect(counter.getAttribute('aria-label')).toBe('Cart 2')
      expect(dialog.getAttribute('aria-label')).toBe('Account menu')
      expect(checkout.textContent).toBe('Checkout')
      expect(checkout.getAttribute('aria-label')).toBe('Checkout')
    })

    expect(screen.getByTestId('interactive-subtree')).toBe(subtree)
    expect(screen.getByTestId('account-menu')).toBe(dialog)
    expect(document.activeElement).toBe(checkout)
  })
})
