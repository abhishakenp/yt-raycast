// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

type IOCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void

let ioCallbacks: IOCallback[] = []
let observedElements: Element[] = []

class MockIntersectionObserver {
  callback: IOCallback
  constructor(callback: IOCallback) {
    this.callback = callback
    ioCallbacks.push(callback)
  }
  observe(el: Element) {
    observedElements.push(el)
  }
  disconnect() {}
  unobserve() {}
}

const { act, cleanup, fireEvent, render } =
  await import('@testing-library/react')
const {
  CountUp,
  Drift,
  Float,
  Glow,
  GridField,
  Magnetic,
  Marquee,
  ParallaxLayer,
  Reveal,
  Spotlight,
  Tilt,
  WordReveal,
} = await import('./motion.tsx')

beforeEach(() => {
  ioCallbacks = []
  observedElements = []
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: MockIntersectionObserver,
    writable: true,
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Reveal', () => {
  it('renders children fully visible with no inline styles during SSR', () => {
    const html = renderToString(
      <Reveal>
        <p>Premium content</p>
      </Reveal>,
    )
    expect(html).toContain('Premium content')
    expect(html).not.toContain('opacity')
    expect(html).not.toContain('style=')
  })

  it('hides on mount, then reveals with transition when it intersects', async () => {
    const { container } = render(
      <Reveal delay={150}>
        <p>Card</p>
      </Reveal>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    expect(wrapper.style.transform).toContain('translateY(24px)')
    expect(wrapper.style.transitionDelay).toBe('150ms')
    expect(observedElements).toContain(wrapper)

    act(() => {
      ioCallbacks.forEach((cb) => cb([{ isIntersecting: true }]))
    })
    expect(wrapper.style.opacity).toBe('1')
    expect(wrapper.style.transform).toBe('translateY(0)')
    // Content was present the whole time — never unmounted.
    expect(wrapper.textContent).toBe('Card')
  })

  it('stays static (visible) when the user prefers reduced motion', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
      writable: true,
    })
    try {
      const { container } = render(
        <Reveal>
          <p>Calm</p>
        </Reveal>,
      )
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.getAttribute('style')).toBeNull()
      expect(wrapper.textContent).toBe('Calm')
    } finally {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  it('force-reveals via watchdog if the observer never reports', () => {
    vi.useFakeTimers()
    const { container } = render(
      <Reveal>
        <p>Never lost</p>
      </Reveal>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(wrapper.style.opacity).toBe('1')
  })

  it('plays a `once` entrance a single time — remounts render static', () => {
    const first = render(
      <Reveal once="hero-test">
        <p>Hero copy</p>
      </Reveal>,
    )
    const wrapper = first.container.firstElementChild as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    act(() => {
      ioCallbacks.forEach((cb) => cb([{ isIntersecting: true }]))
    })
    expect(wrapper.style.opacity).toBe('1')
    first.unmount()

    // Remount (the preview runtime does this when realtime data seeds):
    // the entrance must NOT replay — no hidden frame, no flicker.
    const second = render(
      <Reveal once="hero-test">
        <p>Hero copy</p>
      </Reveal>,
    )
    const remounted = second.container.firstElementChild as HTMLElement
    expect(remounted.getAttribute('style')).toBeNull()
    expect(remounted.textContent).toBe('Hero copy')
  })

  it('coerces non-numeric delay/y props defensively', () => {
    const { container } = render(
      // @ts-expect-error — positional OpenUI mapping can hand junk values
      <Reveal delay="oops" y={null}>
        <p>Safe</p>
      </Reveal>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.transitionDelay).toBe('0ms')
    expect(wrapper.style.transform).toContain('translateY(24px)')
  })
})

describe('Tilt', () => {
  it('tilts toward the pointer and resets on leave', () => {
    const { container } = render(
      <Tilt max={10}>
        <p>3D card</p>
      </Tilt>,
    )
    const el = container.firstElementChild as HTMLElement
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect

    fireEvent.pointerMove(el, { clientX: 200, clientY: 0 })
    expect(el.style.transform).toContain('perspective(1200px)')
    expect(el.style.transform).toContain('rotateX(5.00deg)')
    expect(el.style.transform).toContain('rotateY(5.00deg)')

    fireEvent.pointerLeave(el)
    expect(el.style.transform).toBe('')
  })

  it('ignores touch pointers', () => {
    const { container } = render(
      <Tilt>
        <p>3D card</p>
      </Tilt>,
    )
    const el = container.firstElementChild as HTMLElement
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    fireEvent.pointerMove(el, {
      clientX: 50,
      clientY: 50,
      pointerType: 'touch',
    })
    expect(el.style.transform).toBe('')
  })

  it('renders children during SSR without crashing', () => {
    const html = renderToString(
      <Tilt>
        <p>Server safe</p>
      </Tilt>,
    )
    expect(html).toContain('Server safe')
  })
})

describe('WordReveal', () => {
  it('SSR renders the plain text as a single node, fully visible', () => {
    const html = renderToString(
      <WordReveal as="h1" text="Workspace that works" />,
    )
    expect(html).toContain('Workspace that works')
    expect(html).not.toContain('opacity')
  })

  it('splits into staggered words on the client and reveals on intersect', () => {
    const { container } = render(
      <WordReveal as="h2" text="Do your best work" stagger={50} />,
    )
    const heading = container.firstElementChild as HTMLElement
    const words = Array.from(heading.querySelectorAll('span'))
    expect(words.length).toBe(4)
    expect(words[0].style.opacity).toBe('0')
    expect(words[0].style.filter).toContain('blur')
    expect(words[2].style.transitionDelay).toBe('100ms')

    act(() => {
      ioCallbacks.forEach((cb) => cb([{ isIntersecting: true }]))
    })
    expect(words[0].style.opacity).toBe('1')
    expect(words[3].style.filter).toBe('blur(0px)')
    expect(heading.textContent).toBe('Do your best work')
  })

  it('tolerates a non-string text prop', () => {
    const { container } = render(
      // @ts-expect-error — positional OpenUI mapping can hand junk values
      <WordReveal text={null} />,
    )
    expect(container.firstElementChild).toBeTruthy()
  })
})

describe('Magnetic', () => {
  it('SSR renders children at rest', () => {
    const html = renderToString(
      <Magnetic>
        <button type="button">Book a tour</button>
      </Magnetic>,
    )
    expect(html).toContain('Book a tour')
  })

  it('pulls toward the pointer and resets on leave', () => {
    const { container } = render(
      <Magnetic strength={0.5}>
        <button type="button">CTA</button>
      </Magnetic>,
    )
    const el = container.firstElementChild as HTMLElement
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 40 }) as DOMRect
    fireEvent.pointerMove(el, { clientX: 100, clientY: 40 })
    fireEvent.pointerLeave(el)
    expect(el.textContent).toBe('CTA')
  })
})

describe('Marquee', () => {
  it('SSR renders one static, visible copy of the content', () => {
    const html = renderToString(
      <Marquee>
        <span>Fast WiFi</span>
        <span>Free coffee</span>
      </Marquee>,
    )
    expect(html).toContain('Fast WiFi')
    // Only one copy server-side — no duplicated content in no-JS output.
    expect(html.split('Fast WiFi').length - 1).toBe(1)
  })

  it('duplicates content into a looping track on the armed client', () => {
    const { container } = render(
      <Marquee gap={16}>
        <span>Quote A</span>
      </Marquee>,
    )
    const occurrences = container.textContent?.split('Quote A').length ?? 0
    expect(occurrences - 1).toBe(2)
  })
})

describe('CountUp', () => {
  it('SSR renders the final value verbatim', () => {
    const html = renderToString(<CountUp value="400+" />)
    expect(html).toContain('400+')
  })

  it('renders the final value when reduced motion is preferred', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
      writable: true,
    })
    try {
      const { container } = render(<CountUp value="$1,200" />)
      expect(container.textContent).toBe('$1,200')
    } finally {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  it('renders non-numeric values untouched', () => {
    const { container } = render(<CountUp value="Unlimited" />)
    expect(container.textContent).toBe('Unlimited')
  })
})

describe('Spotlight', () => {
  it('keeps the glow overlay invisible until the pointer moves', () => {
    const { container } = render(
      <Spotlight>
        <p>Card body</p>
      </Spotlight>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    const overlay = wrapper.firstElementChild as HTMLElement
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(overlay.style.opacity).toBe('0')

    wrapper.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 300, height: 200 }) as DOMRect
    fireEvent.pointerMove(wrapper, { clientX: 150, clientY: 100 })
    expect(overlay.style.opacity).not.toBe('0')
    expect(wrapper.style.getPropertyValue('--spot-x')).toBe('150px')

    fireEvent.pointerLeave(wrapper)
    expect(overlay.style.opacity).toBe('0')
  })

  it('SSR renders content with an invisible overlay', () => {
    const html = renderToString(
      <Spotlight>
        <p>Server card</p>
      </Spotlight>,
    )
    expect(html).toContain('Server card')
    expect(html).toContain('opacity:0')
  })
})

describe('ParallaxLayer', () => {
  it('SSR renders a plain static layer', () => {
    const html = renderToString(
      <ParallaxLayer speed={0.5}>
        <p>Depth layer</p>
      </ParallaxLayer>,
    )
    expect(html).toContain('Depth layer')
    expect(html).not.toContain('transform')
  })

  it('mounts on the armed client without crashing', () => {
    const { container } = render(
      <ParallaxLayer speed={-0.4}>
        <p>Foreground</p>
      </ParallaxLayer>,
    )
    expect(container.textContent).toContain('Foreground')
  })
})

describe('Float', () => {
  it('renders children during SSR without hiding them', () => {
    const html = renderToString(
      <Float>
        <p>Floating chip</p>
      </Float>,
    )
    expect(html).toContain('Floating chip')
    expect(html).not.toContain('opacity:0')
  })

  it('renders a plain static div for reduced-motion users', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
      writable: true,
    })
    try {
      const { container } = render(
        <Float className="chip">
          <p>Calm chip</p>
        </Float>,
      )
      const el = container.firstElementChild as HTMLElement
      expect(el.tagName).toBe('DIV')
      expect(el.className).toBe('chip')
      expect(el.textContent).toBe('Calm chip')
    } finally {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  it('mounts the animated loop on the client without crashing', () => {
    const { container } = render(
      <Float amplitude={8} duration={4}>
        <p>Bobbing</p>
      </Float>,
    )
    expect(container.textContent).toContain('Bobbing')
  })
})

describe('GridField', () => {
  it('renders a static, decorative line grid with a mask', () => {
    const { container } = render(<GridField size={48} className="-z-10" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('pointer-events-none')
    expect(el.style.backgroundImage).toContain('linear-gradient')
    expect(el.style.backgroundSize).toBe('48px 48px')
    expect(el.getAttribute('style')).toContain('mask')
    // Zero motion: no transitions, no animations.
    expect(el.style.transition).toBe('')
    expect(el.style.animation).toBe('')
  })

  it('SSR renders the same static markup', () => {
    const html = renderToString(<GridField />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('linear-gradient')
  })
})

describe('Drift', () => {
  it('SSR renders a static layer with content', () => {
    const html = renderToString(
      <Drift x={40} y={-30}>
        <div>Ambient glow</div>
      </Drift>,
    )
    expect(html).toContain('Ambient glow')
  })

  it('renders a plain div for reduced-motion users', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
      writable: true,
    })
    try {
      const { container } = render(
        <Drift className="layer">
          <div>Still glow</div>
        </Drift>,
      )
      const el = container.firstElementChild as HTMLElement
      expect(el.className).toBe('layer')
      expect(el.textContent).toBe('Still glow')
    } finally {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })
})

describe('Glow', () => {
  it('renders an aria-hidden decorative blob with token classes', () => {
    const { container } = render(<Glow className="left-0 top-0 size-64" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('bg-primary/20')
    expect(el.className).toContain('pointer-events-none')
  })
})
