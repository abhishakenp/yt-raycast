import { treatmentCssSnippet } from './media-contracts.js'

export function ambientBodyClasses(treatment) {
  const map = {
    'grain-overlay': 'relative',
    'duotone-blocks': '',
    'halftone-print': '',
    'tape-sticker': '',
    'clean-glass': '',
    'hard-shadow': '[&_.shadow-card]:shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]',
  }
  return map[treatment] || ''
}

export function injectAmbientStyles(html, treatment) {
  const snippet = treatmentCssSnippet(treatment)
  if (!snippet) return html
  const style = `<style id="kimi-ambient">${snippet}</style>`
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${style}\n</head>`)
  return style + html
}

export function decorPromptLine(treatment, { publication = false } = {}) {
  if (publication) {
    const pubLines = {
      'grain-overlay': 'Apply subtle film grain on the featured masthead band and one archive row (layered divs, no custom CSS file).',
      'duotone-blocks': 'Use bold duotone blocks behind the featured cover image and category chips on archive cards.',
      'halftone-print': 'Use print-shop halftone texture and hard offset shadows on article cards.',
      'tape-sticker': 'Use tape-corner accents and sticker labels on 2-3 archive cards.',
      'clean-glass': 'Use glass panels with hairline borders on nav and the featured cover frame.',
      'hard-shadow': 'Use hard offset shadows on archive cards (riso/print craft).',
    }
    return pubLines[treatment] || pubLines['clean-glass']
  }
  const lines = {
    'grain-overlay': 'Apply subtle film grain on hero and one mid-page band using layered divs (no custom CSS file).',
    'duotone-blocks': 'Use bold duotone blocks behind hero media and one feature section.',
    'halftone-print': 'Use print-shop halftone texture and hard offset shadows on cards.',
    'tape-sticker': 'Use tape-corner accents and sticker labels on 2-3 editorial cards.',
    'clean-glass': 'Use glass panels with hairline borders on nav and hero media frame.',
    'hard-shadow': 'Use hard offset shadows on cards (riso/print craft).',
  }
  return lines[treatment] || lines['clean-glass']
}
