import { composeVerticalDoc } from './vertical-doc.js'

export async function composeEditorial(args) {
  return composeVerticalDoc({
    ...args,
    grammar: { ...args.grammar, pageKind: 'vertical-doc' },
  })
}
