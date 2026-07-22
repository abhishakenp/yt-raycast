import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { Freeform } from './freeform.tsx'

function renderFreeform(def: {
  state: Record<string, string>
  actions: Record<string, string>
  layout: string
}): string {
  const json = JSON.stringify(def)
  const element = createElement(Freeform.component, {
    props: { spec: json },
  } as never)
  return renderToString(element)
}

describe('Freeform capsule', () => {
  it('renders a simple static layout', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div class="p-8"><h1>Hello World</h1></div>',
    })
    expect(html).toContain('Hello World')
    expect(html).toContain('p-8')
  })

  it('interpolates state values into text', () => {
    const html = renderFreeform({
      state: { count: '42', name: 'Test' },
      actions: {},
      layout: '<div><span>{count}</span><p>Hello {name}</p></div>',
    })
    expect(html).toContain('42')
    expect(html).toContain('Hello Test')
  })

  it('interpolates state values into attributes', () => {
    const html = renderFreeform({
      state: { task1done: 'true', task2done: 'false' },
      actions: {},
      layout:
        '<div><input type="checkbox" checked="{task1done}" /><input type="checkbox" checked="{task2done}" /></div>',
    })
    expect(html).toContain('checked')
  })

  it('renders nested HTML structure', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout:
        '<div class="outer"><div class="inner"><span>deep</span></div></div>',
    })
    expect(html).toContain('outer')
    expect(html).toContain('inner')
    expect(html).toContain('deep')
  })

  it('renders self-closing tags', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><input type="text" placeholder="test"/><br/></div>',
    })
    expect(html).toContain('placeholder')
    expect(html).toContain('test')
  })

  it('handles void elements without children (no React error)', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout:
        '<div><input type="text" /><hr/><br/><img src="test.jpg" alt="test" /></div>',
    })
    expect(html).toContain('test.jpg')
    expect(html).toContain('img')
  })

  it('converts class to className and onclick to onClick', () => {
    const html = renderFreeform({
      state: { count: '0' },
      actions: { inc: 'count+1' },
      layout: '<div class="container"><button onclick="inc">+</button></div>',
    })
    expect(html).toContain('container')
    expect(html).toContain('+')
  })

  it('renders UI primitives (Button)', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><Button variant="default">Click me</Button></div>',
    })
    expect(html).toContain('Click me')
  })

  it('renders UI primitives (Card with children)', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout:
        '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content here</CardContent></Card>',
    })
    expect(html).toContain('Title')
    expect(html).toContain('Content here')
  })

  it('renders Badge primitive', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><Badge variant="secondary">Active</Badge></div>',
    })
    expect(html).toContain('Active')
  })

  it('renders Progress primitive with numeric value', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><Progress value="60" /></div>',
    })
    // Progress renders a bar with a width style, not the literal number
    expect(html).toContain('progress')
  })

  it('shows error message for invalid JSON', () => {
    const element = createElement(Freeform.component, {
      props: { spec: 'not valid json' },
    } as never)
    const html = renderToString(element)
    expect(html).toContain('invalid JSON')
  })

  it('shows error message for missing data', () => {
    const element = createElement(Freeform.component, {
      props: {},
    } as never)
    const html = renderToString(element)
    expect(html).toContain('no data')
  })

  it('renders numeric state values correctly', () => {
    const html = renderFreeform({
      state: { count: '0' },
      actions: { inc: 'count+1' },
      layout: '<div><span class="text-6xl">{count}</span></div>',
    })
    expect(html).toContain('0')
    expect(html).toContain('text-6xl')
  })

  it('renders multiple state interpolations', () => {
    const html = renderFreeform({
      state: { x: '10', y: '20', total: '30' },
      actions: {},
      layout:
        '<div><span>{x}</span> + <span>{y}</span> = <span>{total}</span></div>',
    })
    expect(html).toContain('10')
    expect(html).toContain('20')
    expect(html).toContain('30')
  })

  // ── Boolean state ──────────────────────────────────────────────────────

  it('handles boolean state values (true/false)', () => {
    const html = renderFreeform({
      state: { done: 'false' },
      actions: { toggle: 'done' },
      layout: '<div><span>{done}</span></div>',
    })
    expect(html).toContain('false')
  })

  it('maps checked attribute to boolean prop', () => {
    const html = renderFreeform({
      state: { task1done: 'true' },
      actions: {},
      layout: '<div><input type="checkbox" checked="{task1done}" /></div>',
    })
    // In SSR, checked=true renders as checked=""
    expect(html).toContain('checked')
  })

  // ── Multiple root elements ─────────────────────────────────────────────

  it('handles multiple root elements by wrapping in fragment', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div>First</div><div>Second</div>',
    })
    expect(html).toContain('First')
    expect(html).toContain('Second')
  })

  // ── HTML comments ──────────────────────────────────────────────────────

  it('skips HTML comments', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><!-- this is a comment --><span>visible</span></div>',
    })
    expect(html).toContain('visible')
    expect(html).not.toContain('this is a comment')
  })

  // ── HTML attribute mapping ─────────────────────────────────────────────

  it('maps for attribute to htmlFor', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout:
        '<div><label for="email">Email</label><input id="email" type="text" /></div>',
    })
    expect(html).toContain('Email')
    expect(html).toContain('email')
  })

  it('maps readonly to readOnly boolean', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><input type="text" readonly="true" /></div>',
    })
    // React SSR renders readOnly={true} as readonly=""
    expect(html).toMatch(/readonly/i)
  })

  // ── Multi-assignment actions ───────────────────────────────────────────

  it('handles multi-assignment action expressions', () => {
    const html = renderFreeform({
      state: { a: 'false', b: 'false', c: 'false' },
      actions: { clearall: 'a=false b=false c=false' },
      layout: '<div><button onclick="clearall">Clear</button></div>',
    })
    expect(html).toContain('Clear')
  })

  // ── Full todo list widget ──────────────────────────────────────────────

  it('renders a complete todo list widget', () => {
    const html = renderFreeform({
      state: {
        task1: 'Buy groceries',
        task2: 'Walk the dog',
        task3: 'Review PR',
        task1done: 'false',
        task2done: 'false',
        task3done: 'false',
      },
      actions: {
        toggle1: 'task1done',
        toggle2: 'task2done',
        toggle3: 'task3done',
        clearall: 'task1done=false task2done=false task3done=false',
      },
      layout:
        '<section class="border-y border-border bg-background py-16"><div class="mx-auto max-w-lg px-4"><div class="mb-6 flex items-center gap-4"><span class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tasks</span><span class="h-px flex-1 bg-border"></span><button onclick="clearall" class="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">Clear all</button></div><ul class="flex flex-col gap-2"><li class="flex items-center gap-3 border-b border-r border-border bg-card p-4"><input type="checkbox" onclick="toggle1" class="h-5 w-5" /><span class="text-foreground">{task1}</span></li><li class="flex items-center gap-3 border-b border-r border-border bg-card p-4"><input type="checkbox" onclick="toggle2" class="h-5 w-5" /><span class="text-foreground">{task2}</span></li><li class="flex items-center gap-3 border-b border-r border-border bg-card p-4"><input type="checkbox" onclick="toggle3" class="h-5 w-5" /><span class="text-foreground">{task3}</span></li></ul></div></section>',
    })
    expect(html).toContain('Buy groceries')
    expect(html).toContain('Walk the dog')
    expect(html).toContain('Review PR')
    expect(html).toContain('Clear all')
    expect(html).toContain('checkbox')
    // onclick is mapped to onClick handler — won't appear in SSR HTML, but the button text will
    expect(html).toContain('Clear all')
  })

  // ── Counter widget ─────────────────────────────────────────────────────

  it('renders a complete counter widget', () => {
    const html = renderFreeform({
      state: { count: '0' },
      actions: { inc: 'count+1', dec: 'count-1', reset: 'count=0' },
      layout:
        '<section class="border-y border-border bg-background py-20"><div class="mx-auto max-w-2xl px-4"><span class="text-6xl font-extrabold tabular-nums">{count}</span><div class="flex gap-3"><button onclick="dec">-</button><button onclick="inc">+</button><button onclick="reset">Reset</button></div></div></section>',
    })
    expect(html).toContain('0')
    expect(html).toContain('-')
    expect(html).toContain('+')
    expect(html).toContain('Reset')
  })

  // ── Calculator widget ──────────────────────────────────────────────────

  it('renders a calculator widget with state', () => {
    const html = renderFreeform({
      state: { display: '0', operand: '0', operator: '' },
      actions: {
        clear: 'display=0 operand=0 operator=',
        add: 'operator=+',
      },
      layout:
        '<div class="p-8"><div class="text-4xl">{display}</div><div class="flex gap-2"><button onclick="clear">C</button><button onclick="add">+</button></div></div>',
    })
    expect(html).toContain('0')
    expect(html).toContain('C')
    expect(html).toContain('+')
  })

  // ── Error resilience ───────────────────────────────────────────────────

  it('shows error for empty layout', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '',
    })
    expect(html).toContain('invalid layout')
  })

  it('handles unclosed tags gracefully', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div><span>text</div>',
    })
    // Should still render something, not crash
    expect(html).toContain('text')
  })

  // ── JSX sanitization ───────────────────────────────────────────────────

  it('strips JSX .map() expressions from layout', () => {
    const html = renderFreeform({
      state: { task1: 'Buy groceries' },
      actions: {},
      layout:
        '<div><ul>{tasks.map((task, i) => <li key={i}>{task.name}</li>)}</ul><span>{task1}</span></div>',
    })
    // The .map expression should be stripped, but {task1} should still interpolate
    expect(html).toContain('Buy groceries')
    expect(html).not.toContain('tasks.map')
  })

  it('converts className to class', () => {
    const html = renderFreeform({
      state: {},
      actions: {},
      layout: '<div className="p-8">content</div>',
    })
    expect(html).toContain('p-8')
    expect(html).toContain('content')
  })

  it('strips React event handlers with function values', () => {
    const html = renderFreeform({
      state: { count: '0' },
      actions: { inc: 'count+1' },
      layout:
        '<div><button onClick={() => inc()}>+</button><input onChange={() => {}} type="text" /></div>',
    })
    // Should render without crashing, button text should appear
    expect(html).toContain('+')
  })

  it('strips ternary expressions from layout', () => {
    const html = renderFreeform({
      state: { done: 'false' },
      actions: {},
      layout:
        '<div><span class={done ? "line-through" : "text-foreground"}>Task</span></div>',
    })
    expect(html).toContain('Task')
  })

  it('preserves simple {varname} interpolation alongside JSX expressions', () => {
    const html = renderFreeform({
      state: { count: '42', name: 'test' },
      actions: {},
      layout:
        '<div>{items.map(i => <li>{i}</li>)}<span>{count}</span><p>{name}</p></div>',
    })
    expect(html).toContain('42')
    expect(html).toContain('test')
    expect(html).not.toContain('items.map')
  })
})
