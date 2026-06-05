// Core types for the site cloning system

export type SectionKind =
  | "nav"
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "footer"
  | "content"
  | "sidebar"
  | "header"
  | "about"
  | "contact"
  | "blog"
  | "gallery"
  | "unknown"

export interface ClonedSection {
  pageUrl: string
  index: number // order within page
  kind: SectionKind
  program: string // OpenUI-Lang composition from primitives, token classes
  contentRefs: string[] // keys into spec.modules for swappable text
  assets: { slot: string; localUrl: string; aspect: number }[]
  hash: string // for dedup
  source: "scraped" | "native-fallback"
}

export interface ClonedPage {
  url: string
  normalizedUrl: string
  title: string
  sections: ClonedSection[]
  screenshot?: string // base64 or path
  failed: boolean
  error?: string
}

export interface PageGraphNode {
  url: string
  normalizedUrl: string
  outgoing: string[] // links to other pages
  incoming: string[] // links from other pages
}

export interface PageGraph {
  nodes: Map<string, PageGraphNode>
  edges: Array<{ from: string; to: string }>
}

export interface CapturedPage {
  url: string
  normalizedUrl: string
  html: string
  computedStyles: Map<string, Record<string, string>>
  bboxes: Map<string, { x: number; y: number; width: number; height: number }>
  screenshot?: Buffer
  assetUrls: string[]
}

export interface ExtractedTokens {
  background: string
  foreground: string
  primary: string
  secondary: string
  muted: string
  accent: string
  border: string
  radius: string
  fontFamily: string
  spacing: string
}

export interface CloneProgressEvent {
  type: "crawl_progress" | "page_complete" | "page_converting" | "section_complete" | "error" | "done"
  crawled?: number
  total?: number
  pageUrl?: string
  pageIndex?: number
  sectionIndex?: number
  error?: string
}

export interface CloneOptions {
  workspace?: string
  maxDepth?: number
  maxPages?: number
  concurrency?: number
  onEvent?: (event: CloneProgressEvent) => void
  signal?: AbortSignal
}

export interface CloneResult {
  success: boolean
  pages: ClonedPage[]
  theme: ExtractedTokens
  assets: Map<string, string> // original URL -> local path
  graph: PageGraph
  errors: string[]
}
