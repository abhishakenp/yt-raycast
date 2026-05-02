export interface TokenSwatch {
  name: string
  category: string
  cssVar: string
  displayLabel: string
  swatch: string
}

export interface PanelClassification {
  canText: boolean
  canImage: boolean
  isContainer: boolean
  tagCategory: string
}

export interface BreadcrumbEntry {
  eid: string
  label: string
  tagName: string
}

export interface PanelOpenPayload {
  eid: string
  friendlyLabel: string
  tagName: string
  classification: PanelClassification
  thumbnailHtml: string
  computedStyles: Record<string, string>
  rawStyles: Record<string, string>
  tokens: TokenSwatch[]
  breadcrumb: BreadcrumbEntry[]
}

export interface ApplyOptions {
  token?: string
  important?: boolean
  shorthand?: boolean
}

export interface SidesPayload {
  t?: string
  r?: string
  b?: string
  l?: string
}

export interface AiStyleDiffEntry {
  prop: string
  value: string
  token?: string
  important?: boolean
}

export interface AiResponse {
  html?: string
  styleDiff?: AiStyleDiffEntry[]
  error?: string
  tokensUsed?: number
}

export interface TabContext {
  state: PanelOpenPayload
  apply(prop: string, value: string, opts?: ApplyOptions): void
  applySides(sides: SidesPayload, base: 'padding' | 'margin'): void
  requestAi(instruction: string, scope: 'element' | 'section' | 'page'): Promise<AiResponse>
}

export interface TabDef {
  id: string
  label: string
  icon: string
  isVisible?: (cls: PanelClassification) => boolean
  render(body: HTMLElement, ctx: TabContext): () => void
}
