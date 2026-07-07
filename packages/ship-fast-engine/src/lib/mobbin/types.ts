/**
 * Shared type definitions for the Mobbin Pro DNA layer.
 */

export interface MobbinDnaSection {
  type: string
  variant?: string
  note?: string
}

export interface MobbinDna {
  display?: string
  body?: string
  mono?: string
  weights?: string
  layout?: string
  copy?: string
  accents?: string[]
  doctrine?: string[]
  avoid?: string[]
  sections?: MobbinDnaSection[]
  composition?: string
  _bankApp?: string
  _synthesized?: boolean
  _liveMobbin?: boolean
  _liveScreens?: number
}

export interface MobbinCopyExamples {
  headlines: string[]
  subs: string[]
  products: string[]
}

export interface MobbinScreen {
  app: string
  patterns: string[]
  elements: string[]
  screenUrl: string
  screenId: string
}

export interface MobbinAnchor {
  app: string
  category: string | null
  palette: string[] | null
  dna: MobbinDna | null
  copyExamples: MobbinCopyExamples | null
  reason?: string
  accents?: string[]
  liveScreens?: MobbinScreen[]
}
