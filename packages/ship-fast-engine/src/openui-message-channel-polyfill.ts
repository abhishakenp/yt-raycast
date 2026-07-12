interface MessageEventLike {
  data: unknown
}

type MessageHandler = ((event: MessageEventLike) => void) | null

export function ensureMessageChannel(): void {
  if (typeof globalThis.MessageChannel !== 'undefined') return

  class ScheduledMessagePort {
    onmessage: MessageHandler = null
    #target: ScheduledMessagePort | null = null

    setTarget(target: ScheduledMessagePort): void {
      this.#target = target
    }

    postMessage(data: unknown): void {
      const target = this.#target
      setTimeout(() => target?.onmessage?.({ data }), 0)
    }

    start(): void {}

    close(): void {
      this.onmessage = null
      this.#target = null
    }
  }

  class ScheduledMessageChannel {
    port1: ScheduledMessagePort
    port2: ScheduledMessagePort
    constructor() {
      this.port1 = new ScheduledMessagePort()
      this.port2 = new ScheduledMessagePort()
      this.port1.setTarget(this.port2)
      this.port2.setTarget(this.port1)
    }
  }

  Object.defineProperty(globalThis, 'MessageChannel', {
    configurable: true,
    value: ScheduledMessageChannel,
    writable: true,
  })
}

ensureMessageChannel()
