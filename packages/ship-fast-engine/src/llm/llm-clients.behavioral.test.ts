import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// --- Groq: mock config + global fetch ---------------------------------------

const groqConfig = vi.hoisted(() => ({
  GROQ_API_KEY: 'test-groq-key',
  GROQ_HOST: 'https://api.groq.com',
  GROQ_MODEL: 'openai/gpt-oss-120b',
  OLLAMA_API_KEY: 'test-ollama-key',
  OLLAMA_HOST: 'https://ollama.example.com',
  LLM_CONFIG: {
    default: { temperature: 0.3, maxTokens: 8000 },
    parallel: { temperature: 0.3, maxTokens: 5000 },
    homepage: { temperature: 0.62, maxTokens: 10000 },
    game: { temperature: 0.5, maxTokens: 24000 },
  },
}))

// Return the hoisted object directly so mutations (e.g. clearing API keys in
// provider-resolution tests) propagate to the mocked module consumers.
vi.mock('../config.js', () => groqConfig)

// Real utils (pure functions) for cost + reasoning leak stripping
import { calculateCost, stripGroqReasoningLeak } from './utils'
import { groq, groqStream, groqParallel } from './groq'

// --- Claude: mock the SDK ----------------------------------------------------

const claudeSdk = vi.hoisted(() => ({
  query: vi.fn(),
}))

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: claudeSdk.query,
}))

import { claude, claudeStream } from './claude'

// --- Translator: no module mock needed — translator calls groq() which calls
// fetch(); translator tests mock fetch directly (same as groq client tests).

import { translateHtml, translateHtmlSequential } from './translator'

// --- Retry: real module (pure) ----------------------------------------------

import { withLLMRetry } from './retry'

// ===========================================================================

describe('groq client: request building', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('builds correct request: model, temperature, maxTokens, messages, stream:false', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'hi' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    await groq('hello', {
      model: 'llama3-70b-8192',
      system: 'be brief',
      temperature: 0.7,
      maxTokens: 1234,
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer test-groq-key')
    expect(init.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(init.body as string)
    expect(body.model).toBe('llama3-70b-8192')
    expect(body.temperature).toBe(0.7)
    expect(body.max_tokens).toBe(1234)
    expect(body.stream).toBe(false)
    expect(body.messages).toEqual([
      { role: 'system', content: 'be brief' },
      { role: 'user', content: 'hello' },
    ])
  })

  it('omits system message when not provided', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'hi' } }],
          usage: {},
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await groq('hello')
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string)
    expect(body.messages).toEqual([{ role: 'user', content: 'hello' }])
  })

  it('defaults model/temperature/maxTokens from config', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'hi' } }],
          usage: {},
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await groq('hello')
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string)
    expect(body.model).toBe('openai/gpt-oss-120b')
    expect(body.temperature).toBe(0.3)
    expect(body.max_tokens).toBe(8000)
  })

  it('passes reasoning_effort, reasoning_format, response_format when provided', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'hi' } }],
          usage: {},
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await groq('hello', {
      reasoningEffort: 'low',
      reasoningFormat: 'hidden',
      responseFormat: { type: 'json_object' },
    })
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string)
    expect(body.reasoning_effort).toBe('low')
    expect(body.reasoning_format).toBe('hidden')
    expect(body.response_format).toEqual({ type: 'json_object' })
  })
})

describe('groq client: response parsing', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('parses content, tokens, tps, cost from usage', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'the answer' } }],
          usage: {
            prompt_tokens: 1000,
            completion_tokens: 500,
            total_time: 2.5,
            prompt_tokens_details: { cached_tokens: 200 },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const r = await groq('q', { model: 'llama3-70b-8192' })
    expect(r.content).toBe('the answer')
    expect(r.inputTokens).toBe(1000)
    expect(r.outputTokens).toBe(500)
    expect(r.cachedInputTokens).toBe(200)
    expect(r.tps).toBe(Math.round(500 / 2.5)) // 200
    expect(r.model).toBe('llama3-70b-8192')
    // llama3-70b-8192 pricing: in 0.59, out 0.79 per 1M
    const expectedCost = (1000 / 1e6) * 0.59 + (500 / 1e6) * 0.79
    expect(r.cost).toBeCloseTo(expectedCost, 8)
  })

  it('tps is 0 when completion_tokens or total_time missing', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'x' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const r = await groq('q')
    expect(r.tps).toBe(0)
  })

  it('returns error object when API responds with data.error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'invalid model' } }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const r = await groq('q')
    expect(r.content).toBe('')
    expect(r.error).toBe('invalid model')
    expect(r.tps).toBe(0)
  })

  it('handles empty choices gracefully', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ usage: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const r = await groq('q')
    expect(r.content).toBe('')
    expect(r.inputTokens).toBe(0)
    expect(r.outputTokens).toBe(0)
  })
})

describe('groq client: streaming (synthesized chunks)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('groqStream calls onToken with chunks and accumulated text', async () => {
    const content = 'A'.repeat(200) // > 64 chunk size, /48 -> ceil(200/48)=5 -> chunkSize 64
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content } }],
          usage: { prompt_tokens: 10, completion_tokens: 200 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const tokens: Array<{ piece: string; acc: string }> = []
    const r = await groqStream('q', {
      onToken: (piece: string, acc: string) => tokens.push({ piece, acc }),
    })
    expect(r.content).toBe(content)
    expect(tokens.length).toBeGreaterThan(1)
    // Each piece + acc, acc grows
    expect(tokens[0].acc).toBe(tokens[0].piece)
    expect(tokens[tokens.length - 1].acc).toBe(content)
    // pieces concatenate to full content
    expect(tokens.map((t) => t.piece).join('')).toBe(content)
  })

  it('groqStream does not call onToken when content is empty', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '' } }], usage: {} }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    let called = false
    await groqStream('q', { onToken: () => (called = true) })
    expect(called).toBe(false)
  })

  it('groqStream strips reasoning leaks from final content', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '<thinking>bad</thinking>real' } }],
          usage: {},
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const r = await groqStream('q')
    expect(r.content).toBe('real')
  })
})

describe('groq client: cost calculation', () => {
  it('calculateCost uses per-model pricing', () => {
    expect(calculateCost('llama3-70b-8192', 1_000_000, 0)).toBeCloseTo(0.59, 6)
    expect(calculateCost('llama3-70b-8192', 0, 1_000_000)).toBeCloseTo(0.79, 6)
    expect(calculateCost('llama3-8b-8192', 1_000_000, 1_000_000)).toBeCloseTo(
      0.05 + 0.08,
      6,
    )
  })

  it('calculateCost falls back to default pricing for unknown model', () => {
    expect(calculateCost('unknown-model', 1_000_000, 0)).toBeCloseTo(0.5, 6)
    expect(calculateCost('unknown-model', 0, 1_000_000)).toBeCloseTo(1.0, 6)
  })

  it('calculateCost returns 0 for zero tokens', () => {
    expect(calculateCost('llama3-70b-8192', 0, 0)).toBe(0)
  })
})

describe('groq client: reasoning leak stripping', () => {
  it('strips <think>...</think> blocks', () => {
    expect(stripGroqReasoningLeak('hello<think>secret</think>world')).toBe(
      'helloworld',
    )
  })

  it('strips <think>...</redacted_thinking> blocks', () => {
    expect(
      stripGroqReasoningLeak('start<think>secret</redacted_thinking>end'),
    ).toBe('startend')
  })

  it('strips <thinking>...</thinking> blocks', () => {
    expect(stripGroqReasoningLeak('<thinking>z</thinking>payload')).toBe(
      'payload',
    )
  })

  it('strips <|thinking|>...<|/thinking|> blocks', () => {
    expect(stripGroqReasoningLeak('<|thinking|>z<|/thinking|>payload')).toBe(
      'payload',
    )
  })

  it('handles missing closing tag without swallowing the rest', () => {
    // <think> without </think> should NOT match the <thinking> regex; the
    // <think> regex requires </think>. So this stays intact.
    expect(stripGroqReasoningLeak('hello<think>no close')).toBe(
      'hello<think>no close',
    )
  })

  it('returns empty string for null/undefined', () => {
    expect(stripGroqReasoningLeak(null as unknown as string)).toBe('')
    expect(stripGroqReasoningLeak(undefined as unknown as string)).toBe('')
  })

  it('trimStarts after stripping leading reasoning', () => {
    expect(stripGroqReasoningLeak('<thinking>x</thinking>   text')).toBe('text')
  })
})

describe('groq client: provider resolution (GROQ vs OLLAMA)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('routes to Groq host for normal models', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'x' } }], usage: {} }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await groq('q', { model: 'llama3-70b-8192' })
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.groq.com/openai/v1/chat/completions',
    )
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer test-groq-key',
    )
  })

  it('routes to Ollama host for :cloud-suffixed models with OLLAMA_API_KEY', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'x' } }], usage: {} }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await groq('q', { model: 'qwen3:cloud' })
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://ollama.example.com/v1/chat/completions',
    )
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer test-ollama-key',
    )
  })

  it('throws when GROQ_API_KEY missing and model is not :cloud', async () => {
    const saved = groqConfig.GROQ_API_KEY
    groqConfig.GROQ_API_KEY = '' as unknown as string
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'x' } }], usage: {} }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await expect(groq('q', { model: 'llama3-70b-8192' })).rejects.toThrow(
      'GROQ_API_KEY not set',
    )
    groqConfig.GROQ_API_KEY = saved
  })

  it('throws when OLLAMA_API_KEY missing and model is :cloud', async () => {
    const saved = groqConfig.OLLAMA_API_KEY
    groqConfig.OLLAMA_API_KEY = '' as unknown as string
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'x' } }], usage: {} }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    await expect(groq('q', { model: 'qwen:cloud' })).rejects.toThrow(
      'OLLAMA_API_KEY not set',
    )
    groqConfig.OLLAMA_API_KEY = saved
  })
})

describe('groq client: groqParallel', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('runs all calls in parallel and returns array of results', async () => {
    // Use mockImplementation so each call gets a fresh Response (body can
    // only be read once; mockResolvedValue shares a single Response object).
    fetchSpy.mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'r' } }],
            usage: { prompt_tokens: 1, completion_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    )
    const results = await groqParallel(
      [
        { prompt: 'a', system: 's1' },
        { prompt: 'b', temperature: 0.9, maxTokens: 100 },
      ],
      { model: 'llama3-8b-8192' },
    )
    expect(results).toHaveLength(2)
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(results.every((r) => r.content === 'r')).toBe(true)
    // per-call temperature/maxTokens override opts
    const body1 = JSON.parse(fetchSpy.mock.calls[1][1].body as string)
    expect(body1.temperature).toBe(0.9)
    expect(body1.max_tokens).toBe(100)
    expect(body1.model).toBe('llama3-8b-8192')
  })
})

// ===========================================================================

describe('claude client: request + streaming', () => {
  beforeEach(() => {
    claudeSdk.query.mockReset()
    // provide a stable env so cleanEnv() doesn't blow up
    process.env.PATH = process.env.PATH || '/usr/bin'
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls claude-agent-sdk query with prompt, maxTurns:1, empty tools, permissionMode acceptEdits, includePartialMessages', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'done' }] },
        }
      })(),
    )

    const r = await claude('build a thing', { system: 'be good' })
    expect(claudeSdk.query).toHaveBeenCalledTimes(1)
    const arg = claudeSdk.query.mock.calls[0][0]
    expect(arg.prompt).toBe('build a thing')
    expect(arg.options.maxTurns).toBe(1)
    expect(arg.options.tools).toEqual([])
    expect(arg.options.allowedTools).toEqual([])
    expect(arg.options.permissionMode).toBe('acceptEdits')
    expect(arg.options.includePartialMessages).toBe(true)
    expect(arg.options.systemPrompt).toBe('be good')
    expect(r).toBe('done')
  })

  it('omits systemPrompt when system not provided', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'x' }] },
        }
      })(),
    )
    await claude('hi')
    const arg = claudeSdk.query.mock.calls[0][0]
    expect(arg.options.systemPrompt).toBeUndefined()
  })

  it('accumulates text_delta events from stream_event messages', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'stream_event',
          event: {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'Hel' },
          },
        }
        yield {
          type: 'stream_event',
          event: {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'lo' },
          },
        }
        yield {
          type: 'stream_event',
          event: {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: '' },
          },
        }
      })(),
    )

    const chunks: string[] = []
    const r = await claudeStream('q', {
      onChunk: (c) => chunks.push(c),
    })
    expect(r).toBe('Hello')
    expect(chunks).toEqual(['Hel', 'lo'])
  })

  it('falls back to assistant message blocks when no stream_event deltas arrived', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'assistant',
          message: {
            content: [
              { type: 'text', text: 'block1' },
              { type: 'text', text: 'block2' },
            ],
          },
        }
      })(),
    )

    const r = await claude('q')
    expect(r).toBe('block1block2')
  })

  it('prefers stream_event deltas over assistant fallback (only uses assistant when full is empty)', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'stream_event',
          event: {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'delta' },
          },
        }
        yield {
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'should-not-append' }] },
        }
      })(),
    )
    const r = await claude('q')
    expect(r).toBe('delta')
  })

  it('cleanEnv strips ANTHROPIC_API_KEY and CLAUDECODE from env passed to SDK', async () => {
    process.env.ANTHROPIC_API_KEY = 'leak'
    process.env.CLAUDECODE = '1'
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield {
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'x' }] },
        }
      })(),
    )
    await claude('q')
    const env = claudeSdk.query.mock.calls[0][0].options.env
    expect(env.ANTHROPIC_API_KEY).toBeUndefined()
    expect(env.CLAUDECODE).toBeUndefined()
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.CLAUDECODE
  })

  it('returns empty string when stream produces no text', async () => {
    claudeSdk.query.mockImplementation(() =>
      (async function* () {
        yield { type: 'stream_event', event: { type: 'other' } }
      })(),
    )
    const r = await claude('q')
    expect(r).toBe('')
  })
})

// ===========================================================================

describe('translator: language detection + HTML translation', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // Helper: build a Groq chat completion Response with given content string
  const groqResponse = (content: unknown) =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )

  it('returns original html unchanged when language is english/null', async () => {
    const html = '<p>Hello world</p>'
    const r = await translateHtml(html, {
      language: { code: 'en', name: 'English' },
    })
    expect(r.content).toBe(html)
    expect(r.translatedCount).toBe(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns original html when languageMode is null/undefined', async () => {
    const html = '<p>Hello</p>'
    const r = await translateHtml(html, null as unknown as never)
    expect(r.content).toBe(html)
    expect(r.translatedCount).toBe(0)
  })

  it('returns original html when no visible text nodes extracted', async () => {
    const html =
      '<!DOCTYPE html><html><head></head><body><script>x</script><style>y</style></body></html>'
    const r = await translateHtml(html, {
      language: { code: 'hi', name: 'Hindi' },
    })
    expect(r.content).toBe(html)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('skips translation when text is already localized in target script', async () => {
    // Devanagari "नमस्ते" repeated enough to pass the >=12 + >0.9 ratio bar
    const devanagari = 'नमस्ते '.repeat(20)
    const html = `<body><p>${devanagari}</p></body>`
    const r = await translateHtml(html, {
      language: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        script: 'Devanagari',
      },
    })
    expect(r.content).toBe(html)
    expect(r.translatedCount).toBe(0)
    expect(r.skipped).toBe('already-localized')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('translates HTML preserving structure (only visible text nodes replaced)', async () => {
    const html =
      '<!DOCTYPE html><html><head><style>.x{color:red}</style></head><body><h1>Welcome</h1><p>Hello world</p><script>const x = "Hello world"</script></body></html>'
    // translateTexts -> fetch 1, polishTranslations -> fetch 2, scoreTranslations -> fetch 3 (score 11)
    fetchSpy
      .mockResolvedValueOnce(
        groqResponse(
          JSON.stringify({
            translations: { t0: 'स्वागत है', t1: 'नमस्ते दुनिया' },
          }),
        ),
      )
      .mockResolvedValueOnce(
        groqResponse(
          JSON.stringify({
            translations: { t0: 'स्वागत है', t1: 'नमस्ते दुनिया' },
          }),
        ),
      )
      .mockResolvedValueOnce(
        groqResponse(
          JSON.stringify({ score: 11, reason: 'perfect', weakIds: [] }),
        ),
      )

    const r = await translateHtml(html, {
      language: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        script: 'Devanagari',
      },
    })
    expect(r.content).toContain('स्वागत है')
    expect(r.content).toContain('नमस्ते दुनिया')
    // structure preserved: doctype, html, head, style, script intact
    expect(r.content).toContain('<!DOCTYPE html>')
    expect(r.content).toContain('<style>.x{color:red}</style>')
    expect(r.content).toContain('<script>const x = "Hello world"</script>')
    expect(r.translatedCount).toBeGreaterThan(0)
    expect(r.qualityScore).toBe(11)
  })

  it('returns error when LLM returns no translations', async () => {
    const html = '<body><p>Hello world</p></body>'
    // All 3 groq calls return empty/error content
    fetchSpy.mockResolvedValue(groqResponse(''))
    const r = await translateHtml(html, {
      language: { code: 'hi', name: 'Hindi', script: 'Devanagari' },
    })
    expect(r.error).toBe('no translations returned')
    expect(r.content).toBe(html)
  })

  it('translateHtmlSequential keeps English on failure, translates on success', async () => {
    const a = '<body><p>Hello world</p></body>'
    const b = '<body><p>Goodbye</p></body>'
    // Page a: translateTexts fetch returns empty -> no translations.
    //   polishTranslations + scoreTranslations skip groq (no items).
    //   rewriteWeakTranslations skips groq (no items). -> 1 fetch total.
    // Page b: translateTexts (fetch 2) + polishTranslations (fetch 3) +
    //   scoreTranslations (fetch 4, score 11) -> 3 fetches.
    fetchSpy
      .mockResolvedValueOnce(groqResponse('')) // a: translateTexts -> empty
      .mockResolvedValueOnce(
        groqResponse(JSON.stringify({ translations: { t0: 'अलविदा' } })),
      ) // b: translateTexts
      .mockResolvedValueOnce(
        groqResponse(JSON.stringify({ translations: { t0: 'अलविदा' } })),
      ) // b: polishTranslations
      .mockResolvedValueOnce(
        groqResponse(JSON.stringify({ score: 11, weakIds: [] })),
      ) // b: scoreTranslations

    const out = await translateHtmlSequential([a, b], {
      language: { code: 'hi', name: 'Hindi', script: 'Devanagari' },
    })
    expect(out).toHaveLength(2)
    expect(out[0]).toBe(a) // failed -> kept English
    expect(out[1]).toContain('अलविदा') // succeeded
  })
})

// ===========================================================================

describe('retry: withLLMRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns result immediately on success (no retry)', async () => {
    const fn = vi.fn().mockResolvedValue({ content: 'ok' })
    const r = await withLLMRetry(fn, { attempts: 3, baseDelayMs: 10 })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(r).toEqual({ content: 'ok' })
  })

  it('retries with exponential backoff on transient errors and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockRejectedValueOnce(new Error('503 service unavailable'))
      .mockResolvedValue({ content: 'ok' })
    const p = withLLMRetry(fn, { attempts: 3, baseDelayMs: 100 })
    // advance through the two backoff delays (100, 200)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)
    const r = await p
    expect(fn).toHaveBeenCalledTimes(3)
    expect(r).toEqual({ content: 'ok' })
  })

  it('retries on transient model-level error in result.error field', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ content: '', error: 'rate limit exceeded' })
      .mockResolvedValue({ content: 'ok' })
    const p = withLLMRetry(fn, { attempts: 2, baseDelayMs: 50 })
    await vi.advanceTimersByTimeAsync(50)
    const r = await p
    expect(fn).toHaveBeenCalledTimes(2)
    expect(r).toEqual({ content: 'ok' })
  })

  it('does NOT retry on permanent (non-transient) result.error', async () => {
    const fn = vi
      .fn()
      .mockResolvedValue({ content: '', error: 'invalid prompt' })
    const r = await withLLMRetry(fn, { attempts: 3, baseDelayMs: 10 })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(r).toEqual({ content: '', error: 'invalid prompt' })
  })

  it('gives up after max retries and throws last error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('timeout'))
    const p = withLLMRetry(fn, { attempts: 3, baseDelayMs: 100 })
    const rejection = expect(p).rejects.toThrow('timeout')
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)
    await rejection
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('gives up after max retries on transient result.error and throws', async () => {
    const fn = vi.fn().mockResolvedValue({ content: '', error: 'overloaded' })
    const p = withLLMRetry(fn, { attempts: 2, baseDelayMs: 50 })
    const rejection = expect(p).rejects.toThrow('overloaded')
    await vi.advanceTimersByTimeAsync(50)
    await rejection
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses default attempts=3 and baseDelayMs=1000 when opts omitted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('502 bad gateway'))
    const p = withLLMRetry(fn)
    const rejection = expect(p).rejects.toThrow('502 bad gateway')
    // 3 attempts -> 2 delays: 1000, 2000
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    await rejection
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('isTransientError detects rate_limit, timeout, overloaded, 503, 502, connection, bad gateway, service unavailable', async () => {
    const cases = [
      'rate limit hit',
      'rate_limit_exceeded',
      'request timeout',
      'overloaded',
      'service unavailable',
      'bad gateway',
      'connection refused',
      '503',
      '502',
    ]
    for (const msg of cases) {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error(msg))
        .mockResolvedValue({ content: 'ok' })
      const p = withLLMRetry(fn, { attempts: 2, baseDelayMs: 1 })
      await vi.advanceTimersByTimeAsync(1)
      const r = await p
      expect(r).toEqual({ content: 'ok' })
      expect(fn).toHaveBeenCalledTimes(2)
    }
  })
})
