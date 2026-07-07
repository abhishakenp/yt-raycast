declare module '@anthropic-ai/claude-agent-sdk' {
  export interface QueryOptions {
    maxTurns?: number
    tools?: unknown[]
    allowedTools?: string[]
    permissionMode?: string
    includePartialMessages?: boolean
    systemPrompt?: string
    env?: Record<string, string | undefined>
  }
  export interface QueryArgs {
    prompt: string
    options?: QueryOptions
  }
  export interface StreamEvent {
    type: string
    event?: {
      type?: string
      delta?: { type?: string; text?: string }
    }
    message?: {
      content?: Array<{ type: string; text?: string }>
    }
  }
  export function query(args: QueryArgs): AsyncIterable<StreamEvent>
}
