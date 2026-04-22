import {
  glassPillAnchorHtml,
  glassPillButtonHtml,
  glassPillSvgDefs,
  GLASS_LENS_FILTER_ID,
} from '../lib/glass-pill-html.ts'

export const SF_GLASS_LENS_FILTER_ID = GLASS_LENS_FILTER_ID

export const sfGlassPillSvgDefs = glassPillSvgDefs

export const sfGlassPillButton = (opts) =>
  glassPillButtonHtml({ ...opts, text: opts.text ?? opts.label })

export const sfGlassPillBody = ({ bodyHtml, ...rest }) =>
  glassPillButtonHtml({ ...rest, html: bodyHtml })

export const sfGlassPillAnchor = (opts) => glassPillAnchorHtml(opts)
