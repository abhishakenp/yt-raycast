export function initRocketExhaust() {
  const exhaustLayers = document.querySelectorAll(
    '.launch-visual .launch-flow, .launch-flow',
  )
  if (exhaustLayers.length === 0) {
    return
  }

  document.body.classList.add('sf-rocket-exhaust-active')
}
