
document.addEventListener('click', (event) => {
  const navToggle = event.target.closest('[data-mobile-nav-toggle]')
  if (navToggle) {
    const header = navToggle.closest('[data-mobile-nav]')
    if (header) header.classList.toggle('is-open')
    return
  }

  const navLink = event.target.closest('[data-mobile-nav] a[href]')
  if (navLink && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches) {
    const header = navLink.closest('[data-mobile-nav]')
    if (header) header.classList.remove('is-open')
  }

  const tabBtn = event.target.closest('[data-tab]')
  if (tabBtn) {
    const group = tabBtn.closest('[data-tab-group]')
    if (group) {
      const key = tabBtn.getAttribute('data-tab')
      group.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-active', b === tabBtn))
      group.querySelectorAll('[data-tab-panel]').forEach((p) => {
        p.hidden = p.getAttribute('data-tab-panel') !== key
      })
    }
    return
  }

  const carBtn = event.target.closest('[data-carousel-prev], [data-carousel-next]')
  if (carBtn) {
    const root = carBtn.closest('[data-carousel]')
    if (root) {
      const track = root.querySelector('[data-carousel-track]')
      if (track) {
        const slides = [...track.children].filter((c) => c.nodeType === 1)
        const n = slides.length
        if (n) {
          let i = Number(root.dataset.carouselIndex || 0)
          if (carBtn.hasAttribute('data-carousel-prev')) i = (i - 1 + n) % n
          else i = (i + 1) % n
          root.dataset.carouselIndex = String(i)
          slides.forEach((s, j) => {
            s.hidden = j !== i
          })
        }
      }
    }
    return
  }

  const billBtn = event.target.closest('[data-pricing-billing] [data-billing]')
  if (billBtn) {
    const root = billBtn.closest('[data-pricing-billing]')
    if (root) {
      const yearly = billBtn.getAttribute('data-billing') === 'year'
      root.querySelectorAll('[data-show-monthly]').forEach((el) => {
        el.hidden = yearly
      })
      root.querySelectorAll('[data-show-yearly]').forEach((el) => {
        el.hidden = !yearly
      })
      root.querySelectorAll('[data-billing]').forEach((b) => {
        b.classList.toggle('is-active', b === billBtn)
      })
    }
    return
  }

  const themeBtn = event.target.closest('[data-theme-toggle]')
  if (themeBtn) {
    document.documentElement.classList.toggle('dark')
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-carousel-track]')
    if (!track) return
    const slides = [...track.children].filter((c) => c.nodeType === 1)
    let i = Number(root.dataset.carouselIndex || 0)
    if (i < 0 || i >= slides.length) i = 0
    root.dataset.carouselIndex = String(i)
    slides.forEach((s, j) => {
      s.hidden = j !== i
    })
  })

  const ease = (t) => 1 - Math.pow(1 - t, 4)
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const raw = el.getAttribute('data-counter-target')
    const target = raw != null && raw !== '' ? Number(raw) : NaN
    if (Number.isNaN(target)) return
    const dur = Math.max(200, parseInt(el.getAttribute('data-counter-duration') || '1100', 10) || 1100)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const node = entry.target
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min(1, (now - start) / dur)
            const v = Math.round(target * ease(t))
            node.textContent = String(v)
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.unobserve(node)
        })
      },
      { threshold: 0.15 },
    )
    io.observe(el)
  })

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.08 },
    )
    io.observe(el)
  })
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => el.classList.add('is-visible'))
  }, 2800)
})

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = form.querySelector('[data-form-message]')
    if (message) message.textContent = 'Thanks. This demo form is ready for a backend integration.'
  })
})
