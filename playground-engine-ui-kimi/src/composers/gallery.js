import { composeVerticalDoc } from './vertical-doc.js'

export async function composeGallery(args) {
  const grammar = {
    ...args.grammar,
    id: args.grammar?.id || 'gallery-masonry',
    heroPattern: 'Typographic hero + masonry visual grid of work.',
    mediaKinds: ['brand-case-wall', 'editorial-spread'],
  }
  return composeVerticalDoc({ ...args, grammar })
}
