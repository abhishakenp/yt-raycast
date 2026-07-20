import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../config.js', () => ({
  GROQ_API_KEY: 'groq-key',
  GROQ_HOST: 'https://groq.test',
  GROQ_MODEL: 'openai/gpt-oss-120b',
  LLM_CONFIG: {
    default: { temperature: 0.3, maxTokens: 8000 },
    parallel: { temperature: 0.2, maxTokens: 5000 },
  },
  OLLAMA_API_KEY: 'ollama-key',
  OLLAMA_HOST: 'https://ollama.test',
}))

interface MockUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_time?: number
  prompt_tokens_details?: { cached_tokens?: number }
}

function completion(content: string, usage: MockUsage = {}): Response {
  return new Response(
    JSON.stringify({
      usage: {
        prompt_tokens: 100,
        completion_tokens: 250,
        total_time: 2.5,
        prompt_tokens_details: { cached_tokens: 25 },
        ...usage,
      },
      choices: [{ message: { content } }],
    }),
  )
}

function errorCompletion(message: string): Response {
  return new Response(JSON.stringify({ error: { message } }))
}

const { groq, groqStream, groqParallel } = await import('./groq.js')

describe('groq', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('posts an OpenAI-compatible Groq request and strips leaked reasoning from the response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      completion('<think>private</think>Visible answer'),
    )

    const result = await groq('Write copy', {
      system: 'System prompt',
      temperature: 0.4,
      maxTokens: 1234,
      reasoningEffort: 'low',
      reasoningFormat: 'hidden',
      responseFormat: { type: 'json_object' },
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, request] = vi.mocked(fetch).mock.calls[0] as [
      string,
      { headers: Record<string, string>; body: string },
    ]
    expect(url).toBe('https://groq.test/openai/v1/chat/completions')
    expect(request.headers).toMatchObject({
      Authorization: 'Bearer groq-key',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(request.body)).toEqual({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'Write copy' },
      ],
      temperature: 0.4,
      max_tokens: 1234,
      stream: false,
      reasoning_effort: 'low',
      reasoning_format: 'hidden',
      response_format: { type: 'json_object' },
    })
    expect(result).toMatchObject({
      content: 'Visible answer',
      tps: 100,
      inputTokens: 100,
      outputTokens: 250,
      cachedInputTokens: 25,
      model: 'openai/gpt-oss-120b',
    })
    expect(result.cost).toBeGreaterThan(0)
  })

  it('routes cloud-suffixed models through the Ollama-compatible endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(completion('Cloud answer'))

    await groq('Prompt', { model: 'llama3:cloud' })

    const [url, request] = vi.mocked(fetch).mock.calls[0] as [
      string,
      { headers: Record<string, string>; body: string },
    ]
    expect(url).toBe('https://ollama.test/v1/chat/completions')
    expect(request.headers.Authorization).toBe('Bearer ollama-key')
    expect(JSON.parse(request.body).model).toBe('llama3:cloud')
  })

  it('returns provider errors without pretending there is content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(errorCompletion('model overloaded'))

    await expect(groq('Prompt')).resolves.toEqual({
      content: '',
      error: 'model overloaded',
      tps: 0,
    })
  })
})

describe('groqStream', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('synthesizes token callbacks from the final response content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      completion('<thinking>hidden</thinking>abcdefghijklmnopqrstuvwxyz'),
    )
    const chunks: Array<{ piece: string; accumulated: string }> = []

    const result = await groqStream('Prompt', {
      onToken: (piece: string, accumulated: string) =>
        chunks.push({ piece, accumulated }),
    })

    expect(result.content).toBe('abcdefghijklmnopqrstuvwxyz')
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks.at(-1)!.accumulated).toBe('abcdefghijklmnopqrstuvwxyz')
  })
})

describe('groqParallel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('uses per-call options with parallel defaults as fallback', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(completion('First'))
      .mockResolvedValueOnce(completion('Second'))

    const results = await groqParallel(
      [
        {
          prompt: 'A',
          system: 'SA',
          temperature: 0.7,
          maxTokens: 111,
          model: 'model-a',
        },
        { prompt: 'B' },
      ],
      { model: 'model-default' },
    )

    expect(results.map((result) => result.content)).toEqual(['First', 'Second'])
    expect(
      JSON.parse(
        (vi.mocked(fetch).mock.calls[0] as [string, { body: string }])[1].body,
      ),
    ).toMatchObject({
      model: 'model-a',
      temperature: 0.7,
      max_tokens: 111,
    })
    expect(
      JSON.parse(
        (vi.mocked(fetch).mock.calls[1] as [string, { body: string }])[1].body,
      ),
    ).toMatchObject({
      model: 'model-default',
      temperature: 0.2,
      max_tokens: 5000,
    })
  })
})
