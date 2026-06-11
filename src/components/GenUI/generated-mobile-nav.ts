type PreviewDeviceMode = 'desktop' | 'tablet' | 'mobile'

type HeaderEnhancement = {
  button: HTMLButtonElement
  createdButton: boolean
  onClick: () => void
  panel: HTMLElement | null
}

const enhancements = new WeakMap<HTMLElement, HeaderEnhancement>()

const desktopNavClassPattern = /(?:^|\s)hidden(?:\s|$).*?(?:^|\s)(?:md|lg|xl):flex(?:\s|$)|(?:^|\s)(?:md|lg|xl):flex(?:\s|$).*?(?:^|\s)hidden(?:\s|$)/
const mobileHiddenClassPattern = /(?:^|\s)(?:md|lg|xl):hidden(?:\s|$)/

const navCandidateTags = new Set(['DIV', 'NAV', 'UL'])

const getClassName = (element: Element): string =>
  typeof element.className === 'string' ? element.className : ''

const isDesktopOnlyNavGroup = (element: Element): element is HTMLElement =>
  navCandidateTags.has(element.tagName) && desktopNavClassPattern.test(getClassName(element))

const isMobileToggle = (element: Element): element is HTMLButtonElement =>
  element.tagName === 'BUTTON' && mobileHiddenClassPattern.test(getClassName(element))

const isGeneratedNode = (element: Element): boolean =>
  element.hasAttribute('data-generated-mobile-nav-button') ||
  element.hasAttribute('data-generated-mobile-nav-panel')

const getNavSourceItems = (header: HTMLElement): HTMLElement[] => {
  const desktopNavs = [...header.querySelectorAll('*')].filter(isDesktopOnlyNavGroup)
  const seenText = new Set<string>()

  return desktopNavs.flatMap((nav) =>
    [...nav.querySelectorAll<HTMLElement>('a, button')].filter((item) => {
      if (isGeneratedNode(item)) return false

      const text = item.textContent.trim()
      if (!text || seenText.has(text)) return false

      seenText.add(text)
      return true
    }),
  )
}

const getPrimaryDesktopNav = (header: HTMLElement): HTMLElement | null =>
  [...header.querySelectorAll('*')].find(isDesktopOnlyNavGroup) ?? null

const createGeneratedButton = (document: Document): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'genui-generated-mobile-nav-button'
  button.setAttribute('aria-label', 'Menu')
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('data-generated-mobile-nav-button', 'true')

  for (let index = 0; index < 3; index += 1) {
    const line = document.createElement('span')
    line.setAttribute('aria-hidden', 'true')
    button.appendChild(line)
  }

  return button
}

const createPanelItem = (source: HTMLElement, document: Document): HTMLButtonElement => {
  const item = document.createElement('button')
  item.type = 'button'
  item.className = 'genui-generated-mobile-nav-item'
  item.textContent = source.textContent.trim()
  item.addEventListener('click', () => source.click())
  return item
}

const createGeneratedPanel = (sourceItems: HTMLElement[], document: Document): HTMLElement => {
  const panel = document.createElement('div')
  panel.className = 'genui-generated-mobile-nav-panel'
  panel.hidden = true
  panel.setAttribute('data-generated-mobile-nav-panel', 'true')

  sourceItems.forEach((source) => panel.appendChild(createPanelItem(source, document)))

  return panel
}

const hasExistingMobilePanel = (header: HTMLElement): boolean =>
  [...header.querySelectorAll('*')].some((element) => {
    if (element.hasAttribute('data-generated-mobile-nav-panel')) return true

    const className = getClassName(element)
    return (
      mobileHiddenClassPattern.test(className) &&
      !isMobileToggle(element) &&
      !isDesktopOnlyNavGroup(element) &&
      element.querySelector('a, button')
    )
  })

const togglePanel = (button: HTMLButtonElement, panel: HTMLElement): void => {
  const nextOpen = button.getAttribute('aria-expanded') !== 'true'
  button.setAttribute('aria-expanded', String(nextOpen))
  panel.hidden = !nextOpen
}

const createFallbackPanelForExistingButton = (
  header: HTMLElement,
  button: HTMLButtonElement,
  sourceItems: HTMLElement[],
): void => {
  const schedule = header.ownerDocument.defaultView?.setTimeout ?? setTimeout

  schedule(() => {
    const state = enhancements.get(header)
    if (!state || state.panel || hasExistingMobilePanel(header)) return

    const panel = createGeneratedPanel(sourceItems, header.ownerDocument)
    header.appendChild(panel)
    state.panel = panel
    togglePanel(button, panel)
  }, 0)
}

const enhanceHeader = (header: HTMLElement): void => {
  if (enhancements.has(header) || hasExistingMobilePanel(header)) return

  const sourceItems = getNavSourceItems(header)
  if (sourceItems.length === 0) return

  const document = header.ownerDocument
  const existingButton = [...header.querySelectorAll('*')].find(isMobileToggle)
  const button = existingButton ?? createGeneratedButton(document)
  const panel = existingButton ? null : createGeneratedPanel(sourceItems, document)
  const onClick = () => {
    if (panel) {
      togglePanel(button, panel)
      return
    }

    createFallbackPanelForExistingButton(header, button, sourceItems)
  }

  header.setAttribute('data-generated-mobile-nav-host', 'true')

  if (!existingButton) {
    const desktopNav = getPrimaryDesktopNav(header)
    const buttonHost = desktopNav?.parentElement ?? header
    buttonHost.appendChild(button)
  } else if (!button.hasAttribute('aria-expanded')) {
    button.setAttribute('aria-expanded', 'false')
  }

  button.addEventListener('click', onClick)
  if (panel) {
    header.appendChild(panel)
  }

  enhancements.set(header, { button, createdButton: !existingButton, onClick, panel })
}

export const cleanupGeneratedMobileNavs = (root: HTMLElement): void => {
  root.querySelectorAll<HTMLElement>('header[data-generated-mobile-nav-host]').forEach((header) => {
    const state = enhancements.get(header)
    state?.button.removeEventListener('click', state.onClick)
    state?.panel?.remove()

    if (state?.createdButton) {
      state.button.remove()
    }

    header.removeAttribute('data-generated-mobile-nav-host')
    enhancements.delete(header)
  })

  root.querySelectorAll('[data-generated-mobile-nav-button], [data-generated-mobile-nav-panel]').forEach((element) =>
    element.remove(),
  )
}

export const enhanceGeneratedMobileNavs = (root: HTMLElement, deviceMode: PreviewDeviceMode): void => {
  if (deviceMode !== 'mobile') {
    cleanupGeneratedMobileNavs(root)
    return
  }

  root.querySelectorAll<HTMLElement>('header').forEach(enhanceHeader)
}

export const observeGeneratedMobileNavs = (
  root: HTMLElement,
  deviceMode: PreviewDeviceMode,
): (() => void) => {
  enhanceGeneratedMobileNavs(root, deviceMode)

  if (deviceMode !== 'mobile') {
    return () => cleanupGeneratedMobileNavs(root)
  }

  const observer = new MutationObserver(() => enhanceGeneratedMobileNavs(root, deviceMode))
  observer.observe(root, { childList: true, subtree: true })

  return () => {
    observer.disconnect()
    cleanupGeneratedMobileNavs(root)
  }
}
