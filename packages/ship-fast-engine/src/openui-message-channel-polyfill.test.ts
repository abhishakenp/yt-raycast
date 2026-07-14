import { afterEach, describe, expect, it, vi } from 'vitest'

import { ensureMessageChannel } from './openui-message-channel-polyfill'

const nativeMessageChannel = globalThis.MessageChannel

afterEach(() => {
  vi.useRealTimers()
  Object.defineProperty(globalThis, 'MessageChannel', {
    configurable: true,
    value: nativeMessageChannel,
    writable: true,
  })
})

describe('ensureMessageChannel', () => {
  it('does not replace an existing native implementation', () => {
    const before = globalThis.MessageChannel

    ensureMessageChannel()

    expect(globalThis.MessageChannel).toBe(before)
  })

  it('installs an asynchronous bidirectional fallback when unavailable', () => {
    vi.useFakeTimers()
    Reflect.deleteProperty(globalThis, 'MessageChannel')
    ensureMessageChannel()
    const channel = new MessageChannel()
    const port1Message = vi.fn()
    const port2Message = vi.fn()
    channel.port1.onmessage = port1Message
    channel.port2.onmessage = port2Message

    channel.port1.postMessage({ from: 'one' })
    channel.port2.postMessage({ from: 'two' })

    expect(port1Message).not.toHaveBeenCalled()
    expect(port2Message).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(port1Message).toHaveBeenCalledWith({ data: { from: 'two' } })
    expect(port2Message).toHaveBeenCalledWith({ data: { from: 'one' } })
  })

  it('suppresses queued delivery after the receiving port closes', () => {
    vi.useFakeTimers()
    Reflect.deleteProperty(globalThis, 'MessageChannel')
    ensureMessageChannel()
    const channel = new MessageChannel()
    const receive = vi.fn()
    channel.port2.onmessage = receive

    channel.port1.postMessage('queued')
    channel.port2.close()
    vi.runAllTimers()

    expect(receive).not.toHaveBeenCalled()
  })
})
