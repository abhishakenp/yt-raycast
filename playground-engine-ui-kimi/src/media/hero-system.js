import { renderArtDirectedImageSurface, inferVisualKind } from './content-imagery.js'
import { MEDIA_TREATMENTS } from './media-contracts.js'

export function heroMediaGuidance(plan, route, variety) {
  const kind = inferVisualKind(plan?.archetype || plan?.brief, { plan, route })
  const treatment = variety?.mediaTreatment || 'clean-glass'
  return {
    kind,
    treatment,
    decorNote: MEDIA_TREATMENTS[treatment] || MEDIA_TREATMENTS['clean-glass'],
    render: (subject, className, index) => renderArtDirectedImageSurface(subject, className, plan, index, route),
  }
}

export { renderArtDirectedImageSurface, inferVisualKind }
