<ChatResponse>
}

/* -------------------------------------------------------------------------- */
/*                               OpenAI Provider                              */
/* -------------------------------------------------------------------------- */

class OpenAIProvider implements Provider {
  name = 'OpenAI'

  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    this.apiKey = key
    this.baseUrl = process.env.OPENAI_API_BASE_URL ?? 'https://api.openai.com/v1'
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.baseUrl}/chat/completions`
    const body = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`OpenAI error ${resp.status}: ${err}`)
    }

    const data = await resp.json()
    const message = data.choices?.[0]?.message?.content ?? ''
    return { content: message, raw: data }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Anthropic Provider                             */
/* -------------------------------------------------------------------------- */

class AnthropicProvider implements Provider {
  name = 'Anthropic'

  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
    this.apiKey = key
    this.baseUrl = process.env.ANTHROPIC_API_BASE_URL ?? 'https://api.anthropic.com/v1'
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.baseUrl}/messages`
    const body = {
      model: request.model,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
      system: request.messages.find(m => m.role === 'system')?.content ?? '',
      messages: request.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: [{ type: 'text', text: m.content }],
        })),
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Anthropic error ${resp.status}: ${err}`)
    }

    const data = await resp.json()
    const content = data.content?.[0]?.text ?? ''
    return { content, raw: data }
  }
}

/* -------------------------------------------------------------------------- */
/*                               Gemini Provider                               */
/* -------------------------------------------------------------------------- */

class GeminiProvider implements Provider {
  name = 'Gemini'

  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    this.apiKey = key
    this.baseUrl = process.env.GEMINI_API_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta'
  }

  private buildUrl(model: string): string {
    // Gemini endpoint pattern: /models/{model}:generateContent?key=API_KEY
    return `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const url = this.buildUrl(request.model)

    const parts = request.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    const body = {
      contents: parts,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 1024,
      },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Gemini error ${resp.status}: ${err}`)
    }

    const data = await resp.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { content, raw: data }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Provider Factory                               */
/* -------------------------------------------------------------------------- */

export class ProviderFactory {
  private static instances: Record<ProviderId, Provider> = {
    openai: new OpenAIProvider(),
    anthropic: new AnthropicProvider(),
    gemini: new GeminiProvider(),
  }

  static get(providerId: ProviderId): Provider {
    const provider = this.instances[providerId]
    if (!provider) throw new Error(`Unsupported provider: ${providerId}`)
    return provider
  }
}

/* -------------------------------------------------------------------------- */
/*                               Exported Service                              */
/* -------------------------------------------------------------------------- */

/**
 * High‑level helper used by the rest of the backend.
 *
 * ```ts
 * const response = await chat(request)
 * console.log(response.content)
 * ```
 */
export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const provider = ProviderFactory.get(request.provider)
  return provider.chat(request)
}