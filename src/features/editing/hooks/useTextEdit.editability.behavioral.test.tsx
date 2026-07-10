// @vitest-environment jsdom
/**
 * "Any text must be editable" — behavioral regression suite.
 *
 * User requirement (2026-07-10): inline editing must work on ANY text in the
 * generated site, regardless of tag or nesting — direct text, text in spans,
 * text next to block children (mixed content), long-form paragraphs, and
 * text in tags outside the old allowlist (code, mark, dt, caption, …).
 *
 * These tests exercise the FULL click flow exactly as DirectPreview wires it:
 * useElementInspector (capture phase, section selection) + useTextEdit
 * (bubble phase, contentEditable activation). A regression in either hook or
 * in their precedence shows up here as "the text didn't activate" or "the
 * inspector stole the click".
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import {
  isEditableTextLeaf,
  lockNonTextChildren,
  useTextEdit,
} from './useTextEdit'
import { useElementInspector } from './useElementInspector'

function mountFlow(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  const onTextChange = vi.fn()
  const onSectionSelect = vi.fn()
  const onImageTarget = vi.fn()
  container.addEventListener('image-target', onImageTarget)
  const hook = renderHook(() => {
    const ref = useRef(container)
    useElementInspector(ref, true, onSectionSelect)
    return useTextEdit(ref, true, onTextChange)
  })
  const cleanup = () => {
    hook.unmount()
    container.remove()
    document.body
      .querySelectorAll('[data-ship-fast-inspector-overlay]')
      .forEach((el) => el.remove())
  }
  return {
    container,
    onTextChange,
    onSectionSelect,
    onImageTarget,
    hook,
    cleanup,
  }
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      }),
    )
  })
}

const activeEditee = (container: HTMLElement) =>
  container.querySelector('[data-ship-fast-inline-editing]')

afterEach(() => {
  document.body.innerHTML = ''
})

// ─── Activation matrix: click target → element that becomes editable ────────

interface ActivationCase {
  name: string
  html: string
  /** CSS selector of the click target (deepest element the user clicks). */
  target: string
  /** CSS selector of the element that must become contenteditable. */
  editable: string
}

const ACTIVATION_MATRIX: ActivationCase[] = [
  // — plain leaves and inline nesting —
  {
    name: 'heading with direct text',
    html: '<h2>Direct heading</h2>',
    target: 'h2',
    editable: 'h2',
  },
  {
    name: 'span inside heading (gradient-span pattern), click span',
    html: '<h2>Work <span class="grad">on Your Terms</span></h2>',
    target: 'span',
    editable: 'span',
  },
  {
    name: 'heading whose only content is a span, click the heading',
    html: '<h2><span>Only Span</span></h2>',
    target: 'h2',
    editable: 'h2',
  },
  {
    name: 'five levels of inline nesting, click the deepest span',
    html: '<p><span>a <em>b <strong>c <span>d <span class="deep">deepest</span></span></strong></em></span></p>',
    target: '.deep',
    editable: '.deep',
  },
  {
    name: 'heading split by <br> between text runs',
    html: '<h1>First line<br>Second line</h1>',
    target: 'h1',
    editable: 'h1',
  },
  {
    name: 'strong inside paragraph, click strong',
    html: '<p>Really <strong>important</strong> point</p>',
    target: 'strong',
    editable: 'strong',
  },
  {
    name: 'small print inside a paragraph',
    html: '<p>Terms apply <small>see details</small></p>',
    target: 'small',
    editable: 'small',
  },
  // — mixed content: direct text next to block children —
  {
    name: 'div with direct text + paragraph child (stat card), click the div',
    html: '<div class="stat">4.9 stars <p>average rating</p></div>',
    target: '.stat',
    editable: '.stat',
  },
  {
    name: 'heading with direct text + div badge child',
    html: '<h3>Total <div class="badge">new</div></h3>',
    target: 'h3',
    editable: 'h3',
  },
  {
    name: 'bold lead inside li that also has a block child, click b',
    html: '<li><b>Bold lead</b><p>rest of item</p></li>',
    target: 'b',
    editable: 'b',
  },
  {
    name: 'li with direct text + nested ul, click the li',
    html: '<ul><li class="outer">Parent item <ul><li>child</li></ul></li></ul>',
    target: '.outer',
    editable: '.outer',
  },
  {
    name: 'eyebrow span next to heading + paragraph siblings',
    html: '<div><span class="eyebrow">FEATURES</span><h2>Title</h2><p>Sub</p></div>',
    target: '.eyebrow',
    editable: '.eyebrow',
  },
  {
    name: 'time element next to a nav in a footer row',
    html: '<div><time datetime="2026">© 2026</time><nav>links</nav></div>',
    target: 'time',
    editable: 'time',
  },
  // — tags outside the old allowlist —
  {
    name: 'inline code inside a paragraph, click code',
    html: '<p>Run <code>bun test</code> now</p>',
    target: 'code',
    editable: 'code',
  },
  {
    name: 'code inside pre (snippet block)',
    html: '<div><pre><code>const x = 1</code></pre><p>caption</p></div>',
    target: 'code',
    editable: 'code',
  },
  {
    name: 'dt in a definition list',
    html: '<dl><dt>Term</dt><dd>Definition</dd></dl>',
    target: 'dt',
    editable: 'dt',
  },
  {
    name: 'dd in a definition list',
    html: '<dl><dt>Term</dt><dd>Definition</dd></dl>',
    target: 'dd',
    editable: 'dd',
  },
  {
    name: 'table caption',
    html: '<table><caption>Monthly totals</caption><tbody><tr><td>1</td></tr></tbody></table>',
    target: 'caption',
    editable: 'caption',
  },
  {
    name: 'table cell',
    html: '<table><tbody><tr><td>Cell text</td></tr></tbody></table>',
    target: 'td',
    editable: 'td',
  },
  {
    name: 'summary in details',
    html: '<details><summary>More info</summary><p>Hidden</p></details>',
    target: 'summary',
    editable: 'summary',
  },
  {
    name: 'figcaption in figure',
    html: '<figure><figcaption>Photo credit</figcaption></figure>',
    target: 'figcaption',
    editable: 'figcaption',
  },
  {
    name: 'mark inside heading, click mark',
    html: '<h2>Save <mark>50%</mark> today</h2>',
    target: 'mark',
    editable: 'mark',
  },
  {
    name: 'cite next to a block child inside blockquote',
    html: '<blockquote><p>Quote body</p><cite>Jane Doe</cite></blockquote>',
    target: 'cite',
    editable: 'cite',
  },
  {
    name: 'address element',
    html: '<footer><address>1 Main St</address><nav>links</nav></footer>',
    target: 'address',
    editable: 'address',
  },
  // — buttons and links —
  {
    name: 'button with svg icon + span, click the span',
    html: '<button><svg viewBox="0 0 24 24"><path d="M0 0"></path></svg><span>Get Started</span></button>',
    target: 'button span',
    editable: 'button span',
  },
  {
    name: 'link with nested span, click the span',
    html: '<a href="/about"><span>About Us</span></a>',
    target: 'a span',
    editable: 'a span',
  },
  // — long-form and unicode —
  {
    name: 'long paragraph (600 chars)',
    html: `<p>${'lorem ipsum '.repeat(50)}</p>`,
    target: 'p',
    editable: 'p',
  },
  {
    name: 'unicode + emoji text in a span',
    html: '<h1><span>नमस्ते 🚀 Grüße</span></h1>',
    target: 'span',
    editable: 'span',
  },
]

describe('activation matrix: any text is editable through the full click flow', () => {
  for (const c of ACTIVATION_MATRIX) {
    it(c.name, () => {
      const { container, onSectionSelect, cleanup } = mountFlow(c.html)
      try {
        const target = container.querySelector(c.target) as HTMLElement
        expect(target, `target selector ${c.target}`).toBeTruthy()
        click(target)
        const expected = container.querySelector(c.editable) as HTMLElement
        expect(
          activeEditee(container),
          `expected <${c.editable}> to become editable (inspector stole the click: ${onSectionSelect.mock.calls.length > 0})`,
        ).toBe(expected)
        // A text click must never fall through to section selection.
        expect(onSectionSelect).not.toHaveBeenCalled()
      } finally {
        cleanup()
      }
    })
  }
})

// ─── Never-editable elements keep their guarantees ───────────────────────────

describe('non-text elements stay non-editable', () => {
  const NEVER_CASES: Array<{ name: string; html: string; target: string }> = [
    {
      name: 'input',
      html: '<form><input type="text" value="hello"></form>',
      target: 'input',
    },
    {
      name: 'textarea',
      html: '<form><textarea>content</textarea></form>',
      target: 'textarea',
    },
    {
      name: 'select option',
      html: '<form><select><option>Pick</option></select></form>',
      target: 'select',
    },
    {
      name: 'whitespace-only element',
      html: '<section><div class="pad">   </div></section>',
      target: '.pad',
    },
  ]
  for (const c of NEVER_CASES) {
    it(`${c.name} never activates a text edit`, () => {
      const { container, cleanup } = mountFlow(c.html)
      try {
        click(container.querySelector(c.target) as HTMLElement)
        expect(activeEditee(container)).toBeNull()
      } finally {
        cleanup()
      }
    })
  }

  it('pathological >5000-char text run does not become editable', () => {
    const { container, cleanup } = mountFlow(
      `<section><p class="huge">${'x'.repeat(6000)}</p></section>`,
    )
    try {
      click(container.querySelector('.huge') as HTMLElement)
      expect(activeEditee(container)).toBeNull()
    } finally {
      cleanup()
    }
  })
})

// ─── Inspector interplay ─────────────────────────────────────────────────────

describe('inspector precedence stays correct', () => {
  it('clicking a section with no direct text still selects the section', () => {
    const { container, onSectionSelect, cleanup } = mountFlow(
      '<section><h2>Heading</h2><p>Body</p></section>',
    )
    try {
      click(container.querySelector('section') as HTMLElement)
      expect(activeEditee(container)).toBeNull()
      expect(onSectionSelect).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'section' }),
      )
    } finally {
      cleanup()
    }
  })

  it('clicking the block child of a mixed container edits the child, not the parent', () => {
    const { container, cleanup } = mountFlow(
      '<div class="mixed">Lead text <p class="child">child para</p></div>',
    )
    try {
      click(container.querySelector('.child') as HTMLElement)
      expect(activeEditee(container)).toBe(container.querySelector('.child'))
    } finally {
      cleanup()
    }
  })
})

// ─── Image precedence ────────────────────────────────────────────────────────

describe('image-click routing', () => {
  it('clicking an image still opens the image swap flow', () => {
    const { container, onImageTarget, cleanup } = mountFlow(
      '<figure><img src="/a.jpg" alt="hero"></figure>',
    )
    try {
      click(container.querySelector('img') as HTMLElement)
      expect(onImageTarget).toHaveBeenCalledTimes(1)
      expect(activeEditee(container)).toBeNull()
    } finally {
      cleanup()
    }
  })

  it('clicking a container that only wraps an image selects the container (image swap stays on the img itself)', () => {
    const { container, onImageTarget, onSectionSelect, cleanup } = mountFlow(
      '<div class="wrap"><img src="/a.jpg" alt="hero"></div>',
    )
    try {
      click(container.querySelector('.wrap') as HTMLElement)
      expect(onImageTarget).not.toHaveBeenCalled()
      expect(activeEditee(container)).toBeNull()
      expect(onSectionSelect).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'div' }),
      )
    } finally {
      cleanup()
    }
  })

  it('clicking the text of a link that also contains an image edits the text', () => {
    const { container, onImageTarget, onTextChange, hook, cleanup } = mountFlow(
      '<a href="/shop">Shop now <img src="/a.jpg" alt="promo"></a>',
    )
    try {
      const link = container.querySelector('a') as HTMLElement
      click(link)
      expect(activeEditee(container)).toBe(link)
      expect(onImageTarget).not.toHaveBeenCalled()
      // The image is locked so text editing can't delete it.
      expect(
        container.querySelector('img')?.getAttribute('contenteditable'),
      ).toBe('false')
      // Commit an edit; the image must survive.
      const textNode = link.firstChild as Text
      textNode.nodeValue = 'Buy now '
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({ oldText: 'Shop now ', newText: 'Buy now ' }),
      )
      expect(container.querySelector('img')).toBeTruthy()
    } finally {
      cleanup()
    }
  })
})

// ─── Full edit cycles on newly-editable structures ───────────────────────────

describe('mixed-container edit cycle', () => {
  const MIXED_HTML =
    '<div class="stat">4.9 stars <p class="child">average rating</p></div>'

  it('locks block children during the edit and unlocks them after commit', () => {
    const { container, hook, cleanup } = mountFlow(MIXED_HTML)
    try {
      const stat = container.querySelector('.stat') as HTMLElement
      const child = container.querySelector('.child') as HTMLElement
      click(stat)
      expect(activeEditee(container)).toBe(stat)
      expect(child.getAttribute('contenteditable')).toBe('false')
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(child.hasAttribute('contenteditable')).toBe(false)
      expect(stat.hasAttribute('contenteditable')).toBe(false)
    } finally {
      cleanup()
    }
  })

  it('committing a direct-text change emits ONLY the direct run, block child untouched', () => {
    const { container, onTextChange, hook, cleanup } = mountFlow(MIXED_HTML)
    try {
      const stat = container.querySelector('.stat') as HTMLElement
      click(stat)
      const directText = stat.firstChild as Text
      directText.nodeValue = '5.0 stars '
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledTimes(1)
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: '4.9 stars ',
          newText: '5.0 stars ',
          element: stat,
          occurrenceIndex: 0,
        }),
      )
      expect(container.querySelector('.child')?.textContent).toBe(
        'average rating',
      )
    } finally {
      cleanup()
    }
  })

  it('Backspace over a selection that includes a locked block child is prevented', () => {
    const { container, cleanup } = mountFlow(MIXED_HTML)
    try {
      const stat = container.querySelector('.stat') as HTMLElement
      const child = container.querySelector('.child') as HTMLElement
      click(stat)
      const range = document.createRange()
      range.setStart(stat.firstChild as Text, 0)
      range.setEnd(child.firstChild as Text, 3)
      const sel = window.getSelection()!
      sel.removeAllRanges()
      sel.addRange(range)
      const backspace = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
      })
      act(() => {
        container.dispatchEvent(backspace)
      })
      expect(backspace.defaultPrevented).toBe(true)
      expect(container.querySelector('.child')?.textContent).toBe(
        'average rating',
      )
    } finally {
      cleanup()
    }
  })

  it('Escape restores the original direct text and structure', () => {
    const { container, onTextChange, cleanup } = mountFlow(MIXED_HTML)
    try {
      const stat = container.querySelector('.stat') as HTMLElement
      click(stat)
      ;(stat.firstChild as Text).nodeValue = 'wrecked '
      act(() => {
        stat.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          }),
        )
      })
      expect(onTextChange).not.toHaveBeenCalled()
      expect(stat.firstChild?.nodeValue).toBe('4.9 stars ')
      expect(container.querySelector('.child')?.textContent).toBe(
        'average rating',
      )
      expect(stat.hasAttribute('contenteditable')).toBe(false)
    } finally {
      cleanup()
    }
  })
})

describe('inline-nested edit cycles preserve structure and emit precise runs', () => {
  it('editing a span inside a heading emits only the span run', () => {
    const { container, onTextChange, hook, cleanup } = mountFlow(
      '<h2>Work <span class="grad">on Your Terms</span></h2>',
    )
    try {
      const span = container.querySelector('.grad') as HTMLElement
      click(span)
      expect(activeEditee(container)).toBe(span)
      ;(span.firstChild as Text).nodeValue = 'on Any Terms'
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledTimes(1)
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'on Your Terms',
          newText: 'on Any Terms',
          element: span,
          occurrenceIndex: 0,
        }),
      )
      // The heading's surrounding text run is untouched.
      expect(container.querySelector('h2')?.textContent).toBe(
        'Work on Any Terms',
      )
    } finally {
      cleanup()
    }
  })

  it('editing inline code emits the code run, addressable in stored HTML', () => {
    const { container, onTextChange, hook, cleanup } = mountFlow(
      '<p>Run <code>bun test</code> now</p>',
    )
    try {
      const code = container.querySelector('code') as HTMLElement
      click(code)
      ;(code.firstChild as Text).nodeValue = 'bun vitest'
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'bun test',
          newText: 'bun vitest',
          element: code,
          occurrenceIndex: 0,
        }),
      )
      expect(container.querySelector('p')?.textContent).toBe(
        'Run bun vitest now',
      )
    } finally {
      cleanup()
    }
  })

  it('editing a deeply nested (5-level) span emits the correct run', () => {
    const { container, onTextChange, hook, cleanup } = mountFlow(
      '<p><span>a <em>b <strong>c <span>d <span class="deep">deepest</span></span></strong></em></span></p>',
    )
    try {
      const deep = container.querySelector('.deep') as HTMLElement
      click(deep)
      expect(activeEditee(container)).toBe(deep)
      ;(deep.firstChild as Text).nodeValue = 'edited deep'
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'deepest',
          newText: 'edited deep',
          element: deep,
          occurrenceIndex: 0,
        }),
      )
    } finally {
      cleanup()
    }
  })

  it('repeated text: editing the second duplicate span reports occurrenceIndex 1', () => {
    const { container, onTextChange, hook, cleanup } = mountFlow(
      '<div><h3><span>Invest Now</span></h3><h3><span class="second">Invest Now</span></h3></div>',
    )
    try {
      const second = container.querySelector('.second') as HTMLElement
      click(second)
      ;(second.firstChild as Text).nodeValue = 'Invest Later'
      act(() => {
        hook.result.current.commitEdit()
      })
      expect(onTextChange).toHaveBeenCalledWith(
        expect.objectContaining({
          oldText: 'Invest Now',
          newText: 'Invest Later',
          occurrenceIndex: 1,
        }),
      )
    } finally {
      cleanup()
    }
  })
})

// ─── Toolbar predicate parity ────────────────────────────────────────────────

describe('isEditableTextLeaf matches activation behavior', () => {
  it('reports true for a mixed container with direct text', () => {
    const div = document.createElement('div')
    div.innerHTML = '4.9 stars <p>average rating</p>'
    document.body.appendChild(div)
    expect(isEditableTextLeaf(div)).toBe(true)
    div.remove()
  })

  it('reports false for a container whose text lives only in block children', () => {
    const section = document.createElement('section')
    section.innerHTML = '<h2>Heading</h2><p>Body</p>'
    document.body.appendChild(section)
    expect(isEditableTextLeaf(section)).toBe(false)
    section.remove()
  })

  it('reports true for formerly-excluded tags with text (code, mark, dt)', () => {
    for (const tag of ['code', 'mark', 'dt', 'caption', 'summary', 'time']) {
      const el = document.createElement(tag)
      el.textContent = 'text'
      document.body.appendChild(el)
      expect(isEditableTextLeaf(el), tag).toBe(true)
      el.remove()
    }
  })
})

// ─── Locking unit behavior ───────────────────────────────────────────────────

describe('lockNonTextChildren scope', () => {
  it('locks block children and no-text children, keeps inline text runs editable', () => {
    const div = document.createElement('div')
    div.innerHTML =
      'lead <span class="inline">inline text</span><p class="block">para</p><svg class="icon"></svg>'
    document.body.appendChild(div)
    const locked = lockNonTextChildren(div)
    expect(div.querySelector('.inline')?.hasAttribute('contenteditable')).toBe(
      false,
    )
    expect(div.querySelector('.block')?.getAttribute('contenteditable')).toBe(
      'false',
    )
    expect(div.querySelector('.icon')?.getAttribute('contenteditable')).toBe(
      'false',
    )
    expect(locked).toHaveLength(2)
    div.remove()
  })
})
