export const ensureMessageChannel = () => {
  if (typeof globalThis.MessageChannel !== 'undefined') return

  class ScheduledMessagePort {
    onmessage = null
    #target = null

    setTarget(target) {
      this.#target = target
    }

    postMessage(data) {
      const target = this.#target
      setTimeout(() => target?.onmessage?.({ data }), 0)
    }

    start() {}

    close() {
      this.onmessage = null
      this.#target = null
    }
  }

  class ScheduledMessageChannel {
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
