
document.addEventListener('click', (event) => {
  const navToggle = event.target.closest('[data-mobile-nav-toggle]')
  if (navToggle) {
    const header = navToggle.closest('[data-mobile-nav]')
    if (header) header.classList.toggle('is-open')
    return
  }

  const trigger = event.target.closest('[data-accordion-trigger]')
  if (!trigger) return

  const item = trigger.closest('[data-accordion-item]')
  const container = trigger.closest('[data-accordion]')
  if (!item || !container) return

  const single = container.dataset.behavior !== 'multi'
  if (single) {
    container.querySelectorAll('[data-accordion-item]').forEach((candidate) => {
      if (candidate !== item) candidate.classList.remove('is-open')
    })
  }
  item.classList.toggle('is-open')
})

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = form.querySelector('[data-form-message]')
    if (message) message.textContent = 'Thanks. This demo form is ready for a backend integration.'
  })
})
