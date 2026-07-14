import { JSDOM, VirtualConsole } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const localizedBakerySource = `
home_navbar = BakeryNavbar("स्वीट क्रम्ब बेकरी", ["होम","मेनू"], "अभी ऑर्डर करें", "मेनू", "0", "")
home_menu = BakeryMenu({"heading":"दैनिक मेनू","description":"आज ताज़ा बेक किया गया","breads":[{"name":"खट्टी रोटी","description":"धीमी आंच पर पकी","price":"₹250"}],"pastries":[],"cakes":[],"addLabel":"कार्ट में जोड़ें"})
home = Stack([home_navbar,home_menu])
menu_navbar = BakeryNavbar("स्वीट क्रम्ब बेकरी", ["होम","मेनू"], "अभी ऑर्डर करें", "मेनू", "0", "")
menu_text = Text("मेनू पृष्ठ")
menu = Stack([menu_navbar,menu_text])
root = PageSwitch(["होम","मेनू"], [home,menu], "", {"होम":"होम","मेनू":"मेनू","अभी ऑर्डर करें":"मेनू"})
`

type OverlayKind = 'auth' | 'cart' | 'search'
type ActivationKey = ' ' | 'Enter'
type ArtifactWindow = Window & typeof globalThis
type ArtifactDom = { window: ArtifactWindow }
type ArtifactOpener = () => ArtifactDom
type ArtifactWaiter = (dom: ArtifactDom, milliseconds?: number) => Promise<void>
type DocumentElementFinder = (document: Document) => HTMLElement
type DocumentButtonFinder = (document: Document) => HTMLButtonElement
type ElementLabelReader = (element: HTMLElement) => string
type OverlayTriggerFinder = (
  document: Document,
  kind: OverlayKind,
) => HTMLButtonElement
type VisibilityCheck = (element: HTMLElement) => boolean
type DialogFinder = (document: Document) => HTMLElement | null
type DialogCloseFinder = (
  dialog: HTMLElement | null,
) => HTMLButtonElement | undefined
type BrowserKeyPress = (
  dom: ArtifactDom,
  element: HTMLElement,
  key: ActivationKey,
) => void
type OverlayOpener = (
  dom: ArtifactDom,
  kind: OverlayKind,
  key?: ActivationKey,
) => Promise<{
  dialog: HTMLElement | null
  trigger: HTMLButtonElement
}>
type MobileNavigationOpener = (
  dom: ArtifactDom,
  key?: ActivationKey,
) => Promise<{
  dialog: HTMLElement | null
  trigger: HTMLButtonElement
}>
type IdReferenceChecker = (document: Document) => string[]
type ReducedMotionChecker = (document: Document) => {
  executable: boolean
  tokens: string[]
}

const overlayActivationCases: Array<[OverlayKind, ActivationKey]> = [
  ['search', 'Enter'],
  ['search', ' '],
  ['cart', 'Enter'],
  ['cart', ' '],
  ['auth', 'Enter'],
  ['auth', ' '],
]

let artifactHtml = ''

const matchingReducedMotion: Window['matchMedia'] = (query) => ({
  addEventListener: () => undefined,
  addListener: () => undefined,
  dispatchEvent: () => false,
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  removeEventListener: () => undefined,
  removeListener: () => undefined,
})

function prepareWindow(window: ArtifactWindow): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: matchingReducedMotion,
  })
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: () => undefined,
  })
  Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => undefined,
  })
}

beforeAll(async () => {
  const built = await buildOpenUIHtmlExport({
    includeBadge: false,
    isDark: false,
    locale: 'hi',
    sessionId: 'localized-accessibility-release',
    siteSpecJson: JSON.stringify({
      locale: 'hi',
      projectName: 'स्वीट क्रम्ब बेकरी',
    }),
    source: localizedBakerySource,
    target: 'html',
    themeName: 'modern-minimal',
  })
  artifactHtml = typeof built.body === 'string' ? built.body : ''
}, 180_000)

const openArtifact: ArtifactOpener = () => {
  const virtualConsole = new VirtualConsole()
  virtualConsole.on('jsdomError', () => undefined)
  return new JSDOM(artifactHtml, {
    beforeParse: prepareWindow,
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://offline-export.test/index.html',
    virtualConsole,
  })
}

const waitForArtifact: ArtifactWaiter = (dom, milliseconds = 0) =>
  new Promise<void>((resolve) => dom.window.setTimeout(resolve, milliseconds))

const activePage: DocumentElementFinder = (document) => {
  const page = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-export-page],[data-sf-export-page]',
    ),
  ).find((candidate) => !candidate.hidden)
  if (!page) throw new Error('Missing active exported page')
  return page
}

const exportedPageLabel: ElementLabelReader = (page) =>
  page.getAttribute('data-export-page') ??
  page.getAttribute('data-sf-export-page') ??
  ''

const headerFor: DocumentElementFinder = (document) => {
  const header = activePage(document).querySelector<HTMLElement>('header')
  if (!header) throw new Error('Missing exported Bakery header')
  return header
}

const mobileTrigger: DocumentButtonFinder = (document) => {
  const trigger = headerFor(document).querySelector<HTMLButtonElement>(
    '[data-slot="sheet-trigger"]',
  )
  if (!trigger) throw new Error('Missing exported mobile navigation trigger')
  return trigger
}

const overlayTrigger: OverlayTriggerFinder = (document, kind) => {
  const header = headerFor(document)
  if (kind === 'search') {
    const search = header.querySelector<HTMLButtonElement>(
      '[data-slot="command-search-trigger"]',
    )
    if (!search) throw new Error('Missing exported search trigger')
    return search
  }
  if (kind === 'auth') {
    const auth = header.querySelector<HTMLButtonElement>(
      '[data-slot="account-dropdown-unauthenticated"]',
    )
    if (!auth) throw new Error('Missing exported auth trigger')
    return auth
  }

  const excluded = new Set([
    overlayTrigger(document, 'search'),
    mobileTrigger(document),
  ])
  const cart = Array.from(
    header.querySelectorAll<HTMLButtonElement>('button[aria-label]'),
  ).find((button) => !excluded.has(button))
  if (!cart) throw new Error('Missing exported cart trigger')
  return cart
}

const isVisible: VisibilityCheck = (element) =>
  !element.hidden && element.closest('[hidden]') === null

const accessibleName: ElementLabelReader = (element) => {
  const ariaLabel = element.getAttribute('aria-label')?.trim()
  if (ariaLabel) return ariaLabel
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const value = labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim()
    if (value) return value
  }
  const explicitLabel = element.id
    ? Array.from(element.ownerDocument.querySelectorAll('label')).find(
        (label) => label.htmlFor === element.id,
      )
    : undefined
  const label =
    explicitLabel?.textContent?.trim() ??
    element.closest('label')?.textContent?.trim()
  if (label) return label
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

const visibleDialog: DialogFinder = (document) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find(
    isVisible,
  ) ?? null

const dialogCloseControl: DialogCloseFinder = (dialog) => {
  if (!dialog) return undefined
  return (
    dialog.querySelector<HTMLButtonElement>(
      '[data-slot="dialog-close"],[data-slot="sheet-close"]',
    ) ??
    Array.from(dialog.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) =>
        button.textContent?.trim() === '×' ||
        /close|बंद/i.test(accessibleName(button)),
    )
  )
}

const pressAsBrowser: BrowserKeyPress = (dom, element, key) => {
  element.focus()
  const keydown = new dom.window.KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
  })
  const shouldRunDefault = element.dispatchEvent(keydown)
  if (key === 'Enter' && shouldRunDefault) element.click()
  const keyup = new dom.window.KeyboardEvent('keyup', {
    bubbles: true,
    cancelable: true,
    key,
  })
  element.dispatchEvent(keyup)
  if (key === ' ' && shouldRunDefault && !keyup.defaultPrevented) {
    element.click()
  }
}

const openOverlay: OverlayOpener = async (dom, kind, key = 'Enter') => {
  const trigger = overlayTrigger(dom.window.document, kind)
  pressAsBrowser(dom, trigger, key)
  await waitForArtifact(dom, 20)
  return { dialog: visibleDialog(dom.window.document), trigger }
}

const openMobileNavigation: MobileNavigationOpener = async (
  dom,
  key = 'Enter',
) => {
  const trigger = mobileTrigger(dom.window.document)
  pressAsBrowser(dom, trigger, key)
  await waitForArtifact(dom, 20)
  return { dialog: visibleDialog(dom.window.document), trigger }
}

const allIdReferenceFailures: IdReferenceChecker = (document) => {
  const failures: string[] = []
  for (const element of document.querySelectorAll<HTMLElement>(
    '[aria-controls],[aria-describedby],[aria-labelledby]',
  )) {
    for (const attribute of [
      'aria-controls',
      'aria-describedby',
      'aria-labelledby',
    ]) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      for (const id of value.split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) {
          failures.push(`${element.tagName.toLowerCase()}[${attribute}=${id}]`)
        }
      }
    }
  }
  return failures
}

const reducedMotionShinyContract: ReducedMotionChecker = (document) => {
  const button = document.querySelector<HTMLElement>(
    '[data-slot="account-dropdown-unauthenticated"]',
  )
  const layer = button?.querySelector<HTMLElement>('span[aria-hidden="true"]')
  const tokens = Array.from(layer?.classList ?? []).filter((token) =>
    token.startsWith('motion-reduce:'),
  )
  const reducedRules: string[] = []
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(styleSheet.cssRules)) {
        if (rule.cssText.includes('prefers-reduced-motion')) {
          reducedRules.push(rule.cssText.replaceAll('\\', ''))
        }
      }
    } catch {
      continue
    }
  }
  const executable = tokens.some((token) =>
    reducedRules.some(
      (rule) =>
        rule.includes(`.${token}`) &&
        /(animation|transform|transition-property)\s*:\s*none|transition-duration\s*:\s*0(?:s|ms)?(?:\s*[;}])/i.test(
          rule,
        ),
    ),
  )
  return { executable, tokens }
}

describe('OpenUI standalone HTML accessibility release regressions', () => {
  it('renders both localized route containers before interaction wiring', () => {
    const dom = openArtifact()
    try {
      const pages = Array.from(
        dom.window.document.querySelectorAll<HTMLElement>(
          '[data-export-page],[data-sf-export-page]',
        ),
      )
      const documentShape = {
        htmlLength: artifactHtml.length,
        pageCount: pages.length,
        pageLabels: pages.map(exportedPageLabel),
        visiblePageCount: pages.filter((page) => !page.hidden).length,
      }
      expect(documentShape, JSON.stringify(documentShape)).toEqual({
        htmlLength: expect.any(Number),
        pageCount: 2,
        pageLabels: ['होम', 'मेनू'],
        visiblePageCount: 1,
      })
    } finally {
      dom.window.close()
    }
  })

  it.each<ActivationKey>(['Enter', ' '])(
    'activates route navigation with %j',
    async (key) => {
      const dom = openArtifact()
      try {
        const menuButton = Array.from(
          headerFor(dom.window.document).querySelectorAll<HTMLButtonElement>(
            'nav button',
          ),
        ).find((button) => button.textContent?.trim() === 'मेनू')
        expect(menuButton).toBeDefined()
        if (!menuButton) throw new Error('Missing localized menu route button')
        pressAsBrowser(dom, menuButton, key)
        await waitForArtifact(dom)

        expect(exportedPageLabel(activePage(dom.window.document))).toBe('मेनू')
      } finally {
        dom.window.close()
      }
    },
  )

  it.each(overlayActivationCases)(
    'opens the %s dialog with %j',
    async (kind, key) => {
      const dom = openArtifact()
      try {
        const trigger = overlayTrigger(dom.window.document, kind)
        expect(trigger.tagName).toBe('BUTTON')
        const { dialog } = await openOverlay(dom, kind, key)
        expect(
          dialog,
          `${kind} did not open from ${JSON.stringify(key)}`,
        ).not.toBeNull()
      } finally {
        dom.window.close()
      }
    },
  )

  it('uses non-submitting button semantics for every overlay trigger', () => {
    const dom = openArtifact()
    try {
      expect({
        auth: overlayTrigger(dom.window.document, 'auth').type,
        cart: overlayTrigger(dom.window.document, 'cart').type,
        search: overlayTrigger(dom.window.document, 'search').type,
      }).toEqual({ auth: 'button', cart: 'button', search: 'button' })
    } finally {
      dom.window.close()
    }
  })

  it.each<OverlayKind>(['search', 'cart', 'auth'])(
    '%s dialog moves focus inside, traps it, and restores its trigger',
    async (kind) => {
      const dom = openArtifact()
      try {
        const { dialog, trigger } = await openOverlay(dom, kind)
        expect(dialog, `${kind} dialog was not created`).not.toBeNull()
        if (!dialog) throw new Error(`${kind} dialog was not created`)
        expect(dialog.contains(dom.window.document.activeElement)).toBe(true)

        const outside = activePage(
          dom.window.document,
        ).querySelector<HTMLElement>('main button, section button')
        expect(outside).not.toBeNull()
        if (!outside)
          throw new Error('Missing focusable control outside dialog')
        outside.focus()
        expect(dialog.contains(dom.window.document.activeElement)).toBe(true)

        const close = dialogCloseControl(dialog)
        expect(close).toBeDefined()
        if (!close) throw new Error(`Missing ${kind} dialog close control`)
        pressAsBrowser(dom, close, 'Enter')
        await waitForArtifact(dom, 220)
        expect(dom.window.document.activeElement).toBe(trigger)
      } finally {
        dom.window.close()
      }
    },
  )

  it('gives every exported interactive control a non-empty accessible name', () => {
    const dom = openArtifact()
    try {
      const unnamed = Array.from(
        dom.window.document.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea',
        ),
      )
        .filter(isVisible)
        .filter((element) => accessibleName(element).trim() === '')
        .map((element) => element.outerHTML.slice(0, 160))

      expect(unnamed).toEqual([])
    } finally {
      dom.window.close()
    }
  })

  it('localizes visible and accessible names without mixed English fragments', () => {
    const dom = openArtifact()
    try {
      const document = dom.window.document
      const addButton =
        activePage(document).querySelector<HTMLButtonElement>(
          'button[aria-busy]',
        )
      expect({
        addToCart: addButton ? accessibleName(addButton) : '',
        auth: accessibleName(overlayTrigger(document, 'auth')),
        cart: accessibleName(overlayTrigger(document, 'cart')),
        mobileMenu: accessibleName(mobileTrigger(document)),
        search: accessibleName(overlayTrigger(document, 'search')),
      }).toEqual({
        addToCart: 'कार्ट में जोड़ें खट्टी रोटी',
        auth: 'साइन इन करें',
        cart: 'कार्ट',
        mobileMenu: 'मेनू खोलें',
        search: 'खोजें',
      })
    } finally {
      dom.window.close()
    }
  })

  it('emits unique IDs across every generated route', () => {
    const dom = openArtifact()
    try {
      const ids = Array.from(
        dom.window.document.querySelectorAll<HTMLElement>('[id]'),
      )
        .map((element) => element.id)
        .filter(Boolean)
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
      expect([...new Set(duplicates)]).toEqual([])
    } finally {
      dom.window.close()
    }
  })

  it('resolves every exported ARIA ID reference to an element', () => {
    const dom = openArtifact()
    try {
      expect(allIdReferenceFailures(dom.window.document)).toEqual([])
    } finally {
      dom.window.close()
    }
  })

  it.each<ActivationKey>(['Enter', ' '])(
    'opens mobile navigation with %j and updates trigger state',
    async (key) => {
      const dom = openArtifact()
      try {
        const { dialog, trigger } = await openMobileNavigation(dom, key)
        expect(dialog).not.toBeNull()
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
        expect(trigger.getAttribute('aria-expanded')).toBe('true')
      } finally {
        dom.window.close()
      }
    },
  )

  it('moves focus into mobile navigation and prevents focus escape', async () => {
    const dom = openArtifact()
    try {
      const { dialog } = await openMobileNavigation(dom)
      expect(dialog).not.toBeNull()
      if (!dialog) throw new Error('Mobile navigation dialog was not created')
      expect(dialog.contains(dom.window.document.activeElement)).toBe(true)

      const outside = activePage(
        dom.window.document,
      ).querySelector<HTMLElement>('nav button')
      expect(outside).not.toBeNull()
      if (!outside) throw new Error('Missing desktop navigation focus target')
      outside.focus()
      expect(dialog.contains(dom.window.document.activeElement)).toBe(true)
    } finally {
      dom.window.close()
    }
  })

  it('closes mobile navigation with Escape and restores trigger focus', async () => {
    const dom = openArtifact()
    try {
      const { dialog, trigger } = await openMobileNavigation(dom)
      expect(dialog).not.toBeNull()
      if (!dialog) throw new Error('Mobile navigation dialog was not created')
      dialog.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      )
      await waitForArtifact(dom, 220)

      expect(dialog.closest<HTMLElement>('[role="presentation"]')?.hidden).toBe(
        true,
      )
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(dom.window.document.activeElement).toBe(trigger)
    } finally {
      dom.window.close()
    }
  })

  it('closes mobile navigation from its keyboard close control and restores focus', async () => {
    const dom = openArtifact()
    try {
      const { dialog, trigger } = await openMobileNavigation(dom)
      const close = dialogCloseControl(dialog)
      expect(close).toBeDefined()
      if (!close) throw new Error('Missing mobile navigation close control')
      pressAsBrowser(dom, close, 'Enter')
      await waitForArtifact(dom, 220)

      expect(
        dialog?.closest<HTMLElement>('[role="presentation"]')?.hidden,
      ).toBe(true)
      expect(dom.window.document.activeElement).toBe(trigger)
    } finally {
      dom.window.close()
    }
  })

  it('localizes the mobile navigation close control accessible name', async () => {
    const dom = openArtifact()
    try {
      const { dialog } = await openMobileNavigation(dom)
      const close = dialogCloseControl(dialog)
      expect(close).toBeDefined()
      if (!close) throw new Error('Missing mobile navigation close control')
      expect(accessibleName(close)).toBe('मेनू बंद करें')
    } finally {
      dom.window.close()
    }
  })

  it('navigates from the mobile menu with the keyboard and closes it', async () => {
    const dom = openArtifact()
    try {
      const { dialog } = await openMobileNavigation(dom)
      const menuItem = Array.from(
        dialog?.querySelectorAll<HTMLButtonElement>('nav button') ?? [],
      ).find((button) => button.textContent?.trim() === 'मेनू')
      expect(menuItem).toBeDefined()
      if (!menuItem) throw new Error('Missing mobile menu route control')
      pressAsBrowser(dom, menuItem, 'Enter')
      await waitForArtifact(dom, 220)

      expect(exportedPageLabel(activePage(dom.window.document))).toBe('मेनू')
      expect(
        dialog?.closest<HTMLElement>('[role="presentation"]')?.hidden,
      ).toBe(true)
    } finally {
      dom.window.close()
    }
  })

  it('exposes mobile cart dialog state on its trigger', async () => {
    const dom = openArtifact()
    try {
      const trigger = overlayTrigger(dom.window.document, 'cart')
      expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      pressAsBrowser(dom, trigger, 'Enter')
      await waitForArtifact(dom, 20)
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
      expect(visibleDialog(dom.window.document)).not.toBeNull()
    } finally {
      dom.window.close()
    }
  })

  it('ships an executable reduced-motion alternative for the shiny auth sweep', () => {
    const dom = openArtifact()
    try {
      expect(reducedMotionShinyContract(dom.window.document)).toEqual({
        executable: true,
        tokens: expect.arrayContaining([
          expect.stringMatching(/^motion-reduce:/),
        ]),
      })
    } finally {
      dom.window.close()
    }
  })
})
