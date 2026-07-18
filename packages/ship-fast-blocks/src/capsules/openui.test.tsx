import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod/v4'

import { defineCapsule, withLakebed, type CapsuleComponentRenderer } from './openui.ts'
import { commerceCartLakebed } from '../registry/sections/commerce/cart-lakebed.ts'

describe('defineCapsule Lakebed contract', () => {
  it('gives every capsule default realtime data queries and mutations', async () => {
    const capsule = defineCapsule({
      name: 'DefaultFullstackProbe',
      description: 'Default fullstack capsule probe',
      props: z.object({
        items: z.array(z.string()).optional(),
        title: z.string().optional(),
      }),
      component: () => null,
    })

    expect(capsule.lakebed).toBeTruthy()
    expect(capsule.lakebed?.queries).toHaveProperty('sectionProps')
    expect(capsule.lakebed?.mutations).toHaveProperty('patchSectionProps')
    expect(capsule.lakebed?.mutations).toHaveProperty('appendItem')

    let data = { items: ['generated'], title: 'Generated' }
    const writes: unknown[] = []
    const { context } = createLakebedHandlerContext({
      data,
      props: { items: ['fallback'], title: 'Fallback' },
      setData: async (patch) => {
        data = { ...data, ...patch }
        writes.push(patch)
        return data
      },
      writable: true,
    })

    const sectionProps = capsule.lakebed?.queries?.sectionProps(context)
    expect(sectionProps).toEqual({
      items: ['generated'],
      title: 'Generated',
    })

    await capsule.lakebed?.mutations?.patchSectionProps(context, {
      title: 'Edited',
    })
    await capsule.lakebed?.mutations?.appendItem(context, 'items', 'Live')

    expect(writes).toEqual([
      { title: 'Edited' },
      { items: ['generated', 'Live'] },
    ])
  })

  it('preserves custom Lakebed data keys for shared state like cart', () => {
    const capsule = defineCapsule({
      name: 'CartProbe',
      description: 'Cart fullstack capsule probe',
      props: z.object({
        label: z.string(),
      }),
      lakebed: commerceCartLakebed,
      component: () => null,
    })

    expect(capsule.lakebed?.dataKey).toBe('Cart')
    expect(capsule.lakebed?.mutations).toHaveProperty('addItem')
    expect(capsule.lakebed?.queries).toHaveProperty('cartSummary')
    expect(capsule.lakebed?.mutations).toHaveProperty('patchSectionProps')
    expect(capsule.lakebed?.queries).toHaveProperty('sectionProps')
  })

  it('merges default section props bindings into custom Lakebed definitions', async () => {
    const capsule = defineCapsule({
      name: 'MergedFullstackProbe',
      description: 'Merged custom Lakebed probe',
      props: z.object({
        label: z.string(),
      }),
      lakebed: commerceCartLakebed,
      component: () => null,
    })
    let data = { label: 'Generated' }
    const { context } = createLakebedHandlerContext({
      data,
      props: { label: 'Fallback' },
      setData: async (patch) => {
        data = { ...data, ...patch }
        return data
      },
      writable: true,
    })

    expect(capsule.lakebed?.queries?.sectionProps(context)).toEqual({
      label: 'Generated',
    })

    await capsule.lakebed?.mutations?.patchSectionProps(context, {
      label: 'Edited',
    })

    expect(data).toEqual({ label: 'Edited' })
    expect(capsule.lakebed?.queries).toHaveProperty('cartSummary')
  })
})

describe('defineCapsule data-openui-* attr stamping', () => {
  it('stamps data-openui-component + data-openui-var on root element', () => {
    const capsule = defineCapsule({
      name: 'AttrProbe',
      description: 'Attr stamping probe',
      props: z.object({ label: z.string().optional() }),
      component: ({ props }) => (
        <section className="probe">
          <h1>{props.label ?? 'Hi'}</h1>
        </section>
      ),
    })

    const output = capsule.client.component({
      props: { label: 'World' },
      statementId: 'hero',
    })

    const html = renderToStaticMarkup(output as ReactElement)
    expect(html).toContain('data-openui-component="AttrProbe"')
    expect(html).toContain('data-openui-var="hero"')
  })

  it('preserves existing className when stamping attrs', () => {
    const capsule = defineCapsule({
      name: 'ClassProbe',
      description: 'Class preservation probe',
      props: z.object({}),
      component: () => <div className="my-class">content</div>,
    })

    const output = capsule.client.component({
      props: {},
      statementId: 'nav',
    })

    const html = renderToStaticMarkup(output as ReactElement)
    expect(html).toContain('class="my-class"')
    expect(html).toContain('data-openui-component="ClassProbe"')
    expect(html).toContain('data-openui-var="nav"')
  })

  it('wraps non-element output in a div with data attrs', () => {
    const capsule = defineCapsule({
      name: 'StringProbe',
      description: 'String output probe',
      props: z.object({}),
      component: () => 'just a string',
    })

    const output = capsule.client.component({
      props: {},
      statementId: 'text',
    })

    const html = renderToStaticMarkup(output as ReactElement)
    expect(html).toContain('data-openui-component="StringProbe"')
    expect(html).toContain('data-openui-var="text"')
    expect(html).toContain('just a string')
  })

  it('sets data-openui-var to undefined when statementId is absent', () => {
    const capsule = defineCapsule({
      name: 'NoVarProbe',
      description: 'No var probe',
      props: z.object({}),
      component: () => <div>content</div>,
    })

    const output = capsule.client.component({
      props: {},
    })

    const html = renderToStaticMarkup(output as ReactElement)
    expect(html).toContain('data-openui-component="NoVarProbe"')
    // data-openui-var should be absent (undefined → React omits the attr)
    expect(html).not.toContain('data-openui-var=')
  })

  it('removes generated contentEditable props before rendering capsule output', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const capsule = defineCapsule({
        name: 'EditableProbe',
        description: 'Generated editable prop probe',
        props: z.object({}),
        component: () => (
          <section>
            <h1 contentEditable>Generated editable heading</h1>
          </section>
        ),
      })

      const output = capsule.client.component({
        props: {},
        statementId: 'hero',
      })

      const html = renderToStaticMarkup(output as ReactElement)
      expect(html).toContain('Generated editable heading')
      expect(html).not.toContain('contenteditable')
      expect(
        errorSpy.mock.calls.filter((call) =>
          call.some((value) =>
            String(value).includes('A component is `contentEditable`'),
          ),
        ),
      ).toHaveLength(0)
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('does not add invalid props to fragment capsule output while sanitizing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const capsule = defineCapsule({
        name: 'FragmentProbe',
        description: 'Generated fragment output probe',
        props: z.object({}),
        component: () => (
          <>
            <h1>Fragment heading</h1>
          </>
        ),
      })

      const output = capsule.client.component({
        props: {},
        statementId: 'hero',
      })

      const html = renderToStaticMarkup(output as ReactElement)
      expect(html).toContain('Fragment heading')
      expect(
        errorSpy.mock.calls.filter((call) =>
          call.some(
            (value) =>
              String(value).includes('Invalid prop') ||
              String(value).includes('React.Fragment'),
          ),
        ),
      ).toHaveLength(0)
    } finally {
      errorSpy.mockRestore()
    }
  })
})

describe('withLakebed', () => {
  it('withLakebed is exported and returns a function', () => {
    expect(typeof withLakebed).toBe('function')
  })

  it('wraps a renderer and provides a lakebed client with expected runtime shape', () => {
    let capturedLakebed: Record<string, unknown> | undefined
    const mockRenderer: CapsuleComponentRenderer<unknown, undefined> = (input) => {
      capturedLakebed = input.lakebed as unknown as Record<string, unknown>
      return null
    }

    const wrapped = withLakebed(mockRenderer, undefined, 'TestCapsule')
    expect(typeof wrapped).toBe('function')

    ;(wrapped as unknown as (input: Record<string, unknown>) => unknown)({
      props: { foo: 'bar' },
      statementId: 'stmt1',
    })

    expect(capturedLakebed).toBeTruthy()
    // createLakebedClient returns a runtime with hook functions; the
    // capsule/definition/props are captured in its closure.
    expect(typeof capturedLakebed?.useData).toBe('function')
    expect(typeof capturedLakebed?.useQuery).toBe('function')
    expect(typeof capturedLakebed?.useMutation).toBe('function')
    expect(typeof capturedLakebed?.useAuth).toBe('function')
    expect(typeof capturedLakebed?.signInWithGoogle).toBe('function')
    expect(typeof capturedLakebed?.signOut).toBe('function')
  })
})
