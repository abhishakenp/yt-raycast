declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string, options?: any)
    readonly window: any
  }
  export class VirtualConsole {
    on(event: 'jsdomError', listener: (error: unknown) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
    forwardTo(console: Console): this
  }
}
