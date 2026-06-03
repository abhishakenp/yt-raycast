import { animate } from 'https://esm.sh/framer-motion@12.38.0/dom'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function run() {
  if (prefersReducedMotion()) return
  document.querySelectorAll('.product-carousel__track--css').forEach((track) => {
    if (track.closest('[data-swiper-managed]')) return
    track.style.animation = 'none'
    const carousel = track.closest('.product-carousel')
    const controls = animate(
      track,
      { x: ['0%', '-50%'] },
      { duration: 50, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
    )
    if (carousel && controls && typeof controls.pause === 'function' && typeof controls.play === 'function') {
      carousel.addEventListener('mouseenter', () => controls.pause())
      carousel.addEventListener('mouseleave', () => controls.play())
    }
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run, { once: true })
} else {
  run()
}
