import { describe, it, expect } from 'vitest'
import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  MAX_CHAT_MESSAGE_LENGTH,
  CHAT_REFINEMENT_RE,
  CHAT_LEGACY_REFINEMENT_NOTE_RE,
  CHAT_OPENUI_REFINEMENT_RE,
  truncateText,
  listSessionChatMessages,
  serializeChatMessage,
  extractQuotedText,
  extractTargetText,
  getChatInstructionIntent,
  replaceFirstElementText,
  applyInstructionDrivenHtmlRefinement,
  buildChatRefinedPreviewHtml,
  normalizePlanString,
  normalizeChatRefinementPlan,
  parseChatRefinementPlanJson,
  applyPlanDrivenHtmlRefinement,
  replaceFirstOpenUiCallText,
  appendOpenUiRefinementNote,
  buildChatRefinedOpenUiSource,
  replaceFirstMatchingJsonString,
  replaceFirstJsonText,
  appendChatRefinementToSiteSpec,
  buildChatRefinedSiteSpecJson,
  appendHtmlBeforeClose,
  buildGeneratedRefinementSection,
  escapeOpenUiString,
  sanitizeOpenUiComment,
  type ChatRefinementPlan,
} from './chat_refinement_helpers'

type ChatMessageRecord = Doc<'chatMessages'>

const sessionId = 'session_chat_history' as Id<'sessions'>

const chatMessageDoc = (
  overrides: Partial<ChatMessageRecord> = {},
): ChatMessageRecord =>
  ({
    _id: 'chat_message_1' as Id<'chatMessages'>,
    _creationTime: 1,
    sessionId,
    role: 'user',
    content: 'Change the headline',
    createdAt: 200,
    ...overrides,
  }) as ChatMessageRecord

const queryCtxForChatMessages = (messages: ChatMessageRecord[]) => {
  const db = {
    query: (table: 'chatMessages') => {
      expect(table).toBe('chatMessages')
      let rows = [...messages]

      const builder = {
        withIndex: (
          indexName: 'by_sessionId_createdAt',
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => unknown,
        ) => {
          expect(indexName).toBe('by_sessionId_createdAt')
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter(
            (message) => message.sessionId === filters.get('sessionId'),
          )

          return builder
        },
        order: (direction: 'asc' | 'desc') => {
          rows = [...rows].sort((left, right) =>
            direction === 'asc'
              ? left.createdAt - right.createdAt
              : right.createdAt - left.createdAt,
          )

          return builder
        },
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db } as Pick<QueryCtx, 'db'>
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

describe('MAX_CHAT_MESSAGE_LENGTH', () => {
  it('is 4000', () => {
    expect(MAX_CHAT_MESSAGE_LENGTH).toBe(4000)
  })
})

describe('chat message history helpers', () => {
  it('serializes chat messages for the client', () => {
    expect(serializeChatMessage(chatMessageDoc())).toEqual({
      messageId: 'chat_message_1',
      role: 'user',
      content: 'Change the headline',
      createdAt: 200,
    })
  })

  it('lists session chat messages oldest first with the query limit applied', async () => {
    const otherSessionId = 'other_session' as Id<'sessions'>
    const messages = [
      chatMessageDoc({ _id: 'chat_new' as Id<'chatMessages'>, createdAt: 300 }),
      chatMessageDoc({ _id: 'chat_old' as Id<'chatMessages'>, createdAt: 100 }),
      chatMessageDoc({
        _id: 'chat_other' as Id<'chatMessages'>,
        sessionId: otherSessionId,
        createdAt: 50,
      }),
    ]

    await expect(
      listSessionChatMessages(queryCtxForChatMessages(messages), sessionId),
    ).resolves.toEqual([
      expect.objectContaining({ messageId: 'chat_old', createdAt: 100 }),
      expect.objectContaining({ messageId: 'chat_new', createdAt: 300 }),
    ])
  })
})

/* ------------------------------------------------------------------ */
/*  Regex constants                                                    */
/* ------------------------------------------------------------------ */

describe('CHAT_REFINEMENT_RE', () => {
  it('matches a chat refinement comment + section block', () => {
    const html = `<div>Hello</div> <!-- ship-fast-chat-refinement:3 --> <section data-ship-fast-chat-refinement="1">stuff</section>`
    const cleaned = html.replace(CHAT_REFINEMENT_RE, '')
    expect(cleaned).toBe('<div>Hello</div>')
  })

  it('matches multiple refinement blocks globally', () => {
    const html = [
      '<p>A</p>',
      '<!-- ship-fast-chat-refinement:1 --> <section data-ship-fast-chat-refinement="1">one</section>',
      '<p>B</p>',
      '<!-- ship-fast-chat-refinement:2 --> <section data-ship-fast-chat-refinement="1">two</section>',
    ].join('\n')
    const cleaned = html.replace(CHAT_REFINEMENT_RE, '')
    expect(cleaned).toContain('<p>A</p>')
    expect(cleaned).toContain('<p>B</p>')
    expect(cleaned).not.toContain('ship-fast-chat-refinement')
  })

  it('does not match unrelated sections', () => {
    const html = '<section class="hero">Content</section>'
    const cleaned = html.replace(CHAT_REFINEMENT_RE, '')
    expect(cleaned).toBe(html)
  })
})

describe('CHAT_LEGACY_REFINEMENT_NOTE_RE', () => {
  it('matches a legacy refinement note block', () => {
    const html = `<div>Main</div> <!-- ship-fast-chat-refinement-note:5 --> <section data-ship-fast-chat-note="1">note text</section>`
    const cleaned = html.replace(CHAT_LEGACY_REFINEMENT_NOTE_RE, '')
    expect(cleaned).toBe('<div>Main</div>')
  })
})

describe('CHAT_OPENUI_REFINEMENT_RE', () => {
  it('matches an OpenUI refinement comment block', () => {
    const source = [
      'Text("Hello")',
      '',
      '// ship-fast-chat-refinement:1',
      '// instruction: change the title',
      '// summary: Updated the title',
    ].join('\n')
    const cleaned = source.replace(CHAT_OPENUI_REFINEMENT_RE, '')
    expect(cleaned).toBe('Text("Hello")')
  })

  it('matches multiple OpenUI refinement blocks', () => {
    const source = [
      'Button("Click")',
      '',
      '// ship-fast-chat-refinement:1',
      '// instruction: first instruction',
      '// summary: first summary',
      '',
      '// ship-fast-chat-refinement:2',
      '// instruction: second instruction',
      '// summary: second summary',
    ].join('\n')
    const cleaned = source.replace(CHAT_OPENUI_REFINEMENT_RE, '')
    expect(cleaned.trim()).toBe('Button("Click")')
  })
})

/* ------------------------------------------------------------------ */
/*  truncateText                                                       */
/* ------------------------------------------------------------------ */

describe('truncateText', () => {
  it('returns the string unchanged when within the limit', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('returns the string unchanged when exactly at the limit', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })

  it('slices the string when it exceeds the limit', () => {
    expect(truncateText('hello world', 5)).toBe('hello')
  })

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('')
  })

  it('handles max of 0', () => {
    expect(truncateText('hello', 0)).toBe('')
  })
})

/* ------------------------------------------------------------------ */
/*  extractQuotedText                                                  */
/* ------------------------------------------------------------------ */

describe('extractQuotedText', () => {
  it('extracts text within curly double quotes', () => {
    expect(extractQuotedText('Set the title to “My Great Site”')).toBe(
      'My Great Site',
    )
  })

  it('extracts text within straight double quotes', () => {
    expect(extractQuotedText('Set the title to "My Great Site"')).toBe(
      'My Great Site',
    )
  })

  it('returns undefined when no quotes present', () => {
    expect(extractQuotedText('Change the headline')).toBeUndefined()
  })

  it('returns undefined for single-char quoted text (below 2 char minimum)', () => {
    expect(extractQuotedText('Say "A"')).toBeUndefined()
  })

  it('trims whitespace from extracted text', () => {
    expect(extractQuotedText('Use " Hello World "')).toBe('Hello World')
  })

  it('handles multiple quoted strings and returns the first', () => {
    expect(extractQuotedText('Replace "Old Title" with "New Title"')).toBe(
      'Old Title',
    )
  })
})

/* ------------------------------------------------------------------ */
/*  extractTargetText                                                  */
/* ------------------------------------------------------------------ */

describe('extractTargetText', () => {
  it('returns quoted text when present', () => {
    expect(extractTargetText('Change headline to "My New Title"')).toBe(
      'My New Title',
    )
  })

  it('falls back to keyword-based extraction', () => {
    expect(extractTargetText('headline: Welcome to the site')).toBe(
      'Welcome to the site',
    )
  })

  it('strips trailing punctuation from keyword extraction', () => {
    expect(extractTargetText('title: Hello World!')).toBe('Hello World')
  })

  it('returns undefined when no pattern matches', () => {
    expect(extractTargetText('add testimonials')).toBeUndefined()
  })

  it('handles "to" keyword', () => {
    expect(extractTargetText('Change it to Build Something Great')).toBe(
      'Build Something Great',
    )
  })

  it('handles "say" keyword', () => {
    expect(extractTargetText('Make it say Welcome to our store')).toBe(
      'Welcome to our store',
    )
  })

  it('handles "button" keyword', () => {
    expect(extractTargetText('button: Get Started Now')).toBe('Get Started Now')
  })
})

/* ------------------------------------------------------------------ */
/*  getChatInstructionIntent                                           */
/* ------------------------------------------------------------------ */

describe('getChatInstructionIntent', () => {
  it('detects headline intent', () => {
    const result = getChatInstructionIntent(
      'Change the headline to "Welcome Home"',
    )
    expect(result).toEqual({ kind: 'headline', targetText: 'Welcome Home' })
  })

  it('detects headline intent with h1 keyword', () => {
    const result = getChatInstructionIntent('Set the h1 to "My App"')
    expect(result).toEqual({ kind: 'headline', targetText: 'My App' })
  })

  it('detects headline intent with hero title keyword', () => {
    const result = getChatInstructionIntent(
      'Update the hero title to "Launch Fast"',
    )
    expect(result).toEqual({ kind: 'headline', targetText: 'Launch Fast' })
  })

  it('detects cta intent', () => {
    const result = getChatInstructionIntent('Change the CTA to "Sign Up Now"')
    expect(result).toEqual({ kind: 'cta', targetText: 'Sign Up Now' })
  })

  it('detects cta intent with button keyword', () => {
    const result = getChatInstructionIntent('Set the button to "Get Started"')
    expect(result).toEqual({ kind: 'cta', targetText: 'Get Started' })
  })

  it('detects cta intent with call-to-action keyword', () => {
    const result = getChatInstructionIntent(
      'Set the call-to-action to "Buy Now"',
    )
    expect(result).toEqual({ kind: 'cta', targetText: 'Buy Now' })
  })

  it('detects replace intent', () => {
    const result = getChatInstructionIntent(
      'Replace "Old Text" with "New Text"',
    )
    expect(result).toEqual({
      kind: 'replace',
      oldText: 'Old Text',
      newText: 'New Text',
    })
  })

  it('detects replace intent with change keyword', () => {
    const result = getChatInstructionIntent('Change "Hello" to "Goodbye"')
    expect(result).toEqual({
      kind: 'replace',
      oldText: 'Hello',
      newText: 'Goodbye',
    })
  })

  it('detects section intent for testimonials', () => {
    const result = getChatInstructionIntent('Add a testimonials section')
    expect(result).toEqual({ kind: 'section', sectionKind: 'testimonials' })
  })

  it('detects section intent for pricing', () => {
    const result = getChatInstructionIntent('Include pricing')
    expect(result).toEqual({ kind: 'section', sectionKind: 'pricing' })
  })

  it('detects section intent for faq', () => {
    const result = getChatInstructionIntent('Create a FAQ section')
    expect(result).toEqual({ kind: 'section', sectionKind: 'faq' })
  })

  it('detects section intent for features', () => {
    const result = getChatInstructionIntent('Add features')
    expect(result).toEqual({ kind: 'section', sectionKind: 'features' })
  })

  it('falls back to note intent for unrecognized instructions', () => {
    const result = getChatInstructionIntent(
      'Make it look better with more color',
    )
    expect(result).toEqual({ kind: 'note' })
  })

  it('falls back to note when headline keyword present but no target text', () => {
    const result = getChatInstructionIntent('headline')
    expect(result).toEqual({ kind: 'note' })
  })
})

/* ------------------------------------------------------------------ */
/*  replaceFirstElementText                                            */
/* ------------------------------------------------------------------ */

describe('replaceFirstElementText', () => {
  it('replaces the text of the first matching h1', () => {
    const html = '<h1>Old Title</h1><p>Body</p>'
    const result = replaceFirstElementText(html, ['h1'], 'New Title')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<h1>New Title</h1><p>Body</p>')
  })

  it('tries tag names in order and uses the first match', () => {
    const html = '<h2>Subtitle</h2><h1>Title</h1>'
    const result = replaceFirstElementText(html, ['h1', 'h2'], 'Updated')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('<h1>Updated</h1>')
    expect(result.html).toContain('<h2>Subtitle</h2>')
  })

  it('falls back to second tag name when first is missing', () => {
    const html = '<h2>Subtitle</h2><p>Body</p>'
    const result = replaceFirstElementText(html, ['h1', 'h2'], 'Updated')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('<h2>Updated</h2>')
  })

  it('returns replaced false when no tag matches', () => {
    const html = '<p>Paragraph</p>'
    const result = replaceFirstElementText(html, ['h1', 'h2'], 'Title')
    expect(result.replaced).toBe(false)
    expect(result.html).toBe(html)
  })

  it('preserves attributes on the replaced element', () => {
    const html = '<h1 class="hero-title" id="main">Old</h1>'
    const result = replaceFirstElementText(html, ['h1'], 'New')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<h1 class="hero-title" id="main">New</h1>')
  })

  it('escapes HTML entities in the replacement text', () => {
    const html = '<h1>Old</h1>'
    const result = replaceFirstElementText(
      html,
      ['h1'],
      '<script>alert("xss")</script>',
    )
    expect(result.replaced).toBe(true)
    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('truncates text longer than 180 characters', () => {
    const html = '<button>Click</button>'
    const longText = 'A'.repeat(200)
    const result = replaceFirstElementText(html, ['button'], longText)
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('A'.repeat(180))
    expect(result.html).not.toContain('A'.repeat(181))
  })

  it('replaces button text', () => {
    const html = '<button type="submit">Submit</button>'
    const result = replaceFirstElementText(html, ['button', 'a'], 'Sign Up')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<button type="submit">Sign Up</button>')
  })

  it('replaces anchor text when button is missing', () => {
    const html = '<a href="/signup" class="cta">Join Now</a>'
    const result = replaceFirstElementText(html, ['button', 'a'], 'Register')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<a href="/signup" class="cta">Register</a>')
  })
})

/* ------------------------------------------------------------------ */
/*  appendHtmlBeforeClose                                              */
/* ------------------------------------------------------------------ */

describe('appendHtmlBeforeClose', () => {
  it('inserts before </main> when present', () => {
    const html = '<main><p>Content</p></main><footer>F</footer>'
    const result = appendHtmlBeforeClose(html, '<section>New</section>')
    expect(result).toBe(
      '<main><p>Content</p><section>New</section></main><footer>F</footer>',
    )
  })

  it('inserts before </body> when no </main>', () => {
    const html = '<body><p>Content</p></body>'
    const result = appendHtmlBeforeClose(html, '<section>New</section>')
    expect(result).toBe('<body><p>Content</p><section>New</section></body>')
  })

  it('appends to the end when neither </main> nor </body> present', () => {
    const html = '<div><p>Content</p></div>'
    const result = appendHtmlBeforeClose(html, '<section>New</section>')
    expect(result).toBe('<div><p>Content</p></div><section>New</section>')
  })

  it('is case-insensitive for </main>', () => {
    const html = '<MAIN>Content</MAIN>'
    const result = appendHtmlBeforeClose(html, '<section>X</section>')
    // The regex replaces the matched </MAIN> with the addition + </main> in lowercase
    expect(result).toBe('<MAIN>Content<section>X</section></main>')
  })
})

/* ------------------------------------------------------------------ */
/*  buildGeneratedRefinementSection                                    */
/* ------------------------------------------------------------------ */

describe('buildGeneratedRefinementSection', () => {
  it('builds a section with title and body', () => {
    const result = buildGeneratedRefinementSection('My Title', 'Some body text')
    expect(result).toContain('<section')
    expect(result).toContain('My Title')
    expect(result).toContain('Some body text')
    expect(result).toContain('</section>')
  })

  it('escapes HTML in title and body', () => {
    const result = buildGeneratedRefinementSection(
      '<b>Title</b>',
      '<script>alert(1)</script>',
    )
    expect(result).not.toContain('<b>Title</b>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;b&gt;Title&lt;/b&gt;')
  })

  it('truncates body to 420 characters', () => {
    const longBody = 'B'.repeat(500)
    const result = buildGeneratedRefinementSection('Title', longBody)
    expect(result).toContain('B'.repeat(420))
    expect(result).not.toContain('B'.repeat(421))
  })
})

/* ------------------------------------------------------------------ */
/*  applyInstructionDrivenHtmlRefinement                                */
/* ------------------------------------------------------------------ */

describe('applyInstructionDrivenHtmlRefinement', () => {
  it('updates a headline when instruction targets headline', () => {
    const html = '<h1>Old Title</h1><p>body</p>'
    const result = applyInstructionDrivenHtmlRefinement(
      html,
      'Change the headline to "New Title"',
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('New Title')
    expect(result.summary).toContain('headline')
  })

  it('updates a CTA button', () => {
    const html = '<h1>Title</h1><button>Old CTA</button>'
    const result = applyInstructionDrivenHtmlRefinement(
      html,
      'Change the CTA to "Subscribe"',
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Subscribe')
    expect(result.summary).toContain('call-to-action')
  })

  it('replaces text when instruction is a replace command', () => {
    const html = '<p>Hello World</p>'
    const result = applyInstructionDrivenHtmlRefinement(
      html,
      'Replace "Hello World" with "Goodbye World"',
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Goodbye World')
  })

  it('adds a section for section intents', () => {
    const html = '<main><h1>Title</h1></main>'
    const result = applyInstructionDrivenHtmlRefinement(
      html,
      'Add a testimonials section',
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('<section')
    expect(result.summary).toContain('testimonials')
  })

  it('falls back to appending a note section for unrecognized instructions', () => {
    const html = '<main><h1>Title</h1></main>'
    const result = applyInstructionDrivenHtmlRefinement(
      html,
      'Make it more colorful and vibrant',
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Latest updates')
    expect(result.summary).toContain('update')
  })
})

/* ------------------------------------------------------------------ */
/*  buildChatRefinedPreviewHtml                                        */
/* ------------------------------------------------------------------ */

describe('buildChatRefinedPreviewHtml', () => {
  it('strips existing refinement blocks before applying', () => {
    const html =
      '<h1>Title</h1> <!-- ship-fast-chat-refinement:1 --> <section data-ship-fast-chat-refinement="1">old note</section>'
    const result = buildChatRefinedPreviewHtml(html, 'Make it brighter')
    expect(result.html).not.toContain('ship-fast-chat-refinement')
    expect(result.changed).toBe(true)
  })

  it('strips legacy refinement note blocks', () => {
    const html =
      '<h1>Title</h1> <!-- ship-fast-chat-refinement-note:2 --> <section data-ship-fast-chat-note="1">old</section>'
    const result = buildChatRefinedPreviewHtml(html, 'Update it')
    expect(result.html).not.toContain('ship-fast-chat-refinement-note')
  })

  it('uses plan-driven refinement when plan is provided and succeeds', () => {
    const html = '<h1>Old Headline</h1>'
    const plan: ChatRefinementPlan = { headline: 'Plan Headline' }
    const result = buildChatRefinedPreviewHtml(
      html,
      'Change the headline',
      plan,
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Plan Headline')
  })

  it('falls back to instruction-driven refinement when plan does not change anything', () => {
    const html = '<h1>Title</h1><button>Click</button>'
    const plan: ChatRefinementPlan = {}
    const result = buildChatRefinedPreviewHtml(
      html,
      'Change the CTA to "Buy Now"',
      plan,
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Buy Now')
  })

  it('handles empty html gracefully', () => {
    const result = buildChatRefinedPreviewHtml('', 'Add something')
    expect(result.changed).toBe(true)
    expect(result.html).toContain('<section')
  })

  it('handles null-ish html input', () => {
    const result = buildChatRefinedPreviewHtml(
      undefined as unknown as string,
      'Add something',
    )
    expect(result.changed).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  normalizePlanString                                                */
/* ------------------------------------------------------------------ */

describe('normalizePlanString', () => {
  it('returns trimmed string within max length', () => {
    expect(normalizePlanString('  hello  ', 10)).toBe('hello')
  })

  it('truncates when string exceeds max', () => {
    expect(normalizePlanString('hello world', 5)).toBe('hello')
  })

  it('returns undefined for non-string value', () => {
    expect(normalizePlanString(123, 10)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(normalizePlanString('', 10)).toBeUndefined()
  })

  it('returns undefined for whitespace-only string', () => {
    expect(normalizePlanString('   ', 10)).toBeUndefined()
  })

  it('returns undefined for null', () => {
    expect(normalizePlanString(null, 10)).toBeUndefined()
  })
})

/* ------------------------------------------------------------------ */
/*  normalizeChatRefinementPlan                                        */
/* ------------------------------------------------------------------ */

describe('normalizeChatRefinementPlan', () => {
  it('returns undefined for non-object input', () => {
    expect(normalizeChatRefinementPlan('string')).toBeUndefined()
    expect(normalizeChatRefinementPlan(123)).toBeUndefined()
    expect(normalizeChatRefinementPlan(null)).toBeUndefined()
    expect(normalizeChatRefinementPlan(undefined)).toBeUndefined()
  })

  it('returns undefined for an array', () => {
    expect(normalizeChatRefinementPlan([1, 2, 3])).toBeUndefined()
  })

  it('returns undefined for empty object (no actionable fields)', () => {
    expect(normalizeChatRefinementPlan({})).toBeUndefined()
  })

  it('returns plan with headline', () => {
    const result = normalizeChatRefinementPlan({ headline: 'Hello' })
    expect(result).toEqual({
      headline: 'Hello',
      ctaLabel: undefined,
      replacements: undefined,
      sections: undefined,
      assistantSummary: undefined,
    })
  })

  it('returns plan with ctaLabel', () => {
    const result = normalizeChatRefinementPlan({ ctaLabel: 'Click Me' })
    expect(result?.ctaLabel).toBe('Click Me')
  })

  it('normalizes replacements correctly', () => {
    const result = normalizeChatRefinementPlan({
      replacements: [
        { oldText: 'old', newText: 'new' },
        { oldText: 'x' },
        'not-an-object',
      ],
    })
    expect(result?.replacements).toHaveLength(1)
    expect(result?.replacements?.[0]).toEqual({
      oldText: 'old',
      newText: 'new',
    })
  })

  it('limits replacements to 8 entries', () => {
    const replacements = Array.from({ length: 12 }, (_, i) => ({
      oldText: `old${i}`,
      newText: `new${i}`,
    }))
    const result = normalizeChatRefinementPlan({ replacements })
    expect(result?.replacements).toHaveLength(8)
  })

  it('normalizes sections correctly', () => {
    const result = normalizeChatRefinementPlan({
      sections: [
        { kind: 'testimonial', title: 'Reviews', body: 'Great service' },
        { title: 'FAQ' },
        { kind: 'pricing' },
      ],
    })
    expect(result?.sections).toHaveLength(2)
    expect(result?.sections?.[0]?.title).toBe('Reviews')
    expect(result?.sections?.[1]?.title).toBe('FAQ')
  })

  it('limits sections to 4 entries', () => {
    const sections = Array.from({ length: 6 }, (_, i) => ({
      title: `Section ${i}`,
      body: `Body ${i}`,
    }))
    const result = normalizeChatRefinementPlan({ sections })
    expect(result?.sections).toHaveLength(4)
  })

  it('filters sections that have neither title nor body', () => {
    const result = normalizeChatRefinementPlan({
      sections: [{ kind: 'testimonial' }],
    })
    expect(result).toBeUndefined()
  })

  it('truncates headline to 180 chars', () => {
    const result = normalizeChatRefinementPlan({ headline: 'X'.repeat(200) })
    expect(result?.headline).toHaveLength(180)
  })

  it('truncates ctaLabel to 120 chars', () => {
    const result = normalizeChatRefinementPlan({ ctaLabel: 'Y'.repeat(150) })
    expect(result?.ctaLabel).toHaveLength(120)
  })

  it('truncates assistantSummary to 500 chars', () => {
    const result = normalizeChatRefinementPlan({
      headline: 'Title',
      assistantSummary: 'Z'.repeat(600),
    })
    expect(result?.assistantSummary).toHaveLength(500)
  })

  it('returns undefined when only assistantSummary is present (no actionable fields)', () => {
    const result = normalizeChatRefinementPlan({
      assistantSummary: 'Just a summary',
    })
    expect(result).toBeUndefined()
  })
})

/* ------------------------------------------------------------------ */
/*  parseChatRefinementPlanJson                                        */
/* ------------------------------------------------------------------ */

describe('parseChatRefinementPlanJson', () => {
  it('returns undefined for undefined input', () => {
    expect(parseChatRefinementPlanJson(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(parseChatRefinementPlanJson('')).toBeUndefined()
  })

  it('returns undefined for whitespace-only string', () => {
    expect(parseChatRefinementPlanJson('   ')).toBeUndefined()
  })

  it('returns undefined for invalid JSON', () => {
    expect(parseChatRefinementPlanJson('{invalid}')).toBeUndefined()
  })

  it('parses valid plan JSON', () => {
    const json = JSON.stringify({ headline: 'New Headline', ctaLabel: 'Click' })
    const result = parseChatRefinementPlanJson(json)
    expect(result?.headline).toBe('New Headline')
    expect(result?.ctaLabel).toBe('Click')
  })

  it('returns undefined when JSON is valid but not actionable', () => {
    expect(parseChatRefinementPlanJson(JSON.stringify({}))).toBeUndefined()
  })

  it('returns undefined when JSON parses to non-object', () => {
    expect(parseChatRefinementPlanJson('"just a string"')).toBeUndefined()
    expect(parseChatRefinementPlanJson('42')).toBeUndefined()
  })
})

/* ------------------------------------------------------------------ */
/*  applyPlanDrivenHtmlRefinement                                      */
/* ------------------------------------------------------------------ */

describe('applyPlanDrivenHtmlRefinement', () => {
  const baseHtml =
    '<main><h1>Old Heading</h1><button>Old CTA</button><p>Some body text</p></main>'

  it('applies headline replacement', () => {
    const plan: ChatRefinementPlan = { headline: 'New Heading' }
    const result = applyPlanDrivenHtmlRefinement(
      baseHtml,
      'update heading',
      plan,
    )
    expect(result.changed).toBe(true)
    expect(result.html).toContain('New Heading')
    expect(result.summary).toContain('headline')
  })

  it('applies CTA label replacement', () => {
    const plan: ChatRefinementPlan = { ctaLabel: 'New CTA' }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'update cta', plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain('New CTA')
    expect(result.summary).toContain('call-to-action')
  })

  it('applies text replacements from plan', () => {
    const plan: ChatRefinementPlan = {
      replacements: [{ oldText: 'Some body text', newText: 'Updated body' }],
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'fix text', plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Updated body')
    expect(result.html).not.toContain('Some body text')
  })

  it('applies multiple replacements', () => {
    const plan: ChatRefinementPlan = {
      replacements: [
        { oldText: 'Old Heading', newText: 'Replaced Heading' },
        { oldText: 'Some body text', newText: 'Replaced body' },
      ],
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'fix text', plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Replaced Heading')
    expect(result.html).toContain('Replaced body')
  })

  it('adds sections from plan', () => {
    const plan: ChatRefinementPlan = {
      sections: [
        {
          kind: 'testimonial',
          title: 'Customer Reviews',
          body: 'Great product!',
        },
      ],
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'add reviews', plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain('Customer Reviews')
    expect(result.html).toContain('Great product!')
  })

  it('uses assistantSummary when provided', () => {
    const plan: ChatRefinementPlan = {
      headline: 'Updated Title',
      assistantSummary: 'Custom summary from the assistant',
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'fix title', plan)
    expect(result.summary).toBe('Custom summary from the assistant')
  })

  it('generates summary when no assistantSummary provided', () => {
    const plan: ChatRefinementPlan = { headline: 'Updated Title' }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'fix title', plan)
    expect(result.summary).toContain('Applied AI refinement plan')
    expect(result.summary).toContain('headline')
  })

  it('reports unchanged when plan does not match anything', () => {
    const html = '<div>Nothing matches</div>'
    const plan: ChatRefinementPlan = { headline: 'New' }
    const result = applyPlanDrivenHtmlRefinement(html, 'fix', plan)
    expect(result.changed).toBe(false)
    expect(result.summary).toContain('did not match')
  })

  it('skips replacements with undefined oldText or newText', () => {
    const plan: ChatRefinementPlan = {
      replacements: [
        { oldText: undefined, newText: 'new' },
        { oldText: 'old', newText: undefined },
      ],
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'fix', plan)
    expect(result.changed).toBe(false)
  })

  it('uses instruction as body when section body is missing', () => {
    const plan: ChatRefinementPlan = {
      sections: [{ title: 'Info' }],
    }
    const instruction = 'Add an information section about the product'
    const result = applyPlanDrivenHtmlRefinement(baseHtml, instruction, plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain(instruction)
  })

  it('uses default title when section title is missing', () => {
    const plan: ChatRefinementPlan = {
      sections: [{ kind: 'faq', body: 'Frequently asked questions content' }],
    }
    const result = applyPlanDrivenHtmlRefinement(baseHtml, 'add faq', plan)
    expect(result.changed).toBe(true)
    expect(result.html).toContain('faq refinement')
  })
})

/* ------------------------------------------------------------------ */
/*  escapeOpenUiString                                                 */
/* ------------------------------------------------------------------ */

describe('escapeOpenUiString', () => {
  it('escapes backslashes', () => {
    expect(escapeOpenUiString('path\\to\\file')).toBe('path\\\\to\\\\file')
  })

  it('escapes double quotes', () => {
    expect(escapeOpenUiString('Say "hello"')).toBe('Say \\"hello\\"')
  })

  it('escapes both backslashes and quotes', () => {
    expect(escapeOpenUiString('\\"')).toBe('\\\\\\"')
  })

  it('returns empty string unchanged', () => {
    expect(escapeOpenUiString('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(escapeOpenUiString('Hello World')).toBe('Hello World')
  })
})

/* ------------------------------------------------------------------ */
/*  sanitizeOpenUiComment                                              */
/* ------------------------------------------------------------------ */

describe('sanitizeOpenUiComment', () => {
  it('normalizes whitespace and truncates to 240 chars', () => {
    const input = '  hello   world  '
    expect(sanitizeOpenUiComment(input)).toBe('hello world')
  })

  it('escapes close-comment sequences', () => {
    expect(sanitizeOpenUiComment('end of comment */')).toBe(
      'end of comment * /',
    )
  })

  it('truncates long strings', () => {
    const long = 'A'.repeat(300)
    const result = sanitizeOpenUiComment(long)
    expect(result).toHaveLength(240)
  })
})

/* ------------------------------------------------------------------ */
/*  replaceFirstOpenUiCallText                                         */
/* ------------------------------------------------------------------ */

describe('replaceFirstOpenUiCallText', () => {
  it('replaces text in the first matching call', () => {
    const source = 'Text("Old Title")\nButton("Click Me")'
    const result = replaceFirstOpenUiCallText(source, ['Text'], 'New Title')
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('Text("New Title")')
    expect(result.source).toContain('Button("Click Me")')
  })

  it('tries call names in order', () => {
    const source = 'Button("Click")\nText("Hello")'
    const result = replaceFirstOpenUiCallText(
      source,
      ['Heading', 'Text'],
      'World',
    )
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('Text("World")')
  })

  it('returns replaced false when no call matches', () => {
    const source = 'Image("photo.jpg")'
    const result = replaceFirstOpenUiCallText(
      source,
      ['Text', 'Heading'],
      'New',
    )
    expect(result.replaced).toBe(false)
    expect(result.source).toBe(source)
  })

  it('escapes special characters in replacement text', () => {
    const source = 'Text("Old")'
    const result = replaceFirstOpenUiCallText(source, ['Text'], 'Say "hello"')
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('Text("Say \\"hello\\"")')
  })

  it('truncates replacement text to 180 chars', () => {
    const source = 'Text("Old")'
    const longText = 'R'.repeat(200)
    const result = replaceFirstOpenUiCallText(source, ['Text'], longText)
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('R'.repeat(180))
    expect(result.source).not.toContain('R'.repeat(181))
  })
})

/* ------------------------------------------------------------------ */
/*  appendOpenUiRefinementNote                                         */
/* ------------------------------------------------------------------ */

describe('appendOpenUiRefinementNote', () => {
  it('appends a refinement note to the source', () => {
    const result = appendOpenUiRefinementNote(
      'Text("Hello")',
      'Change the title',
      'Updated the title',
      3,
    )
    expect(result).toContain('Text("Hello")')
    expect(result).toContain('// ship-fast-chat-refinement:3')
    expect(result).toContain('// instruction: Change the title')
    expect(result).toContain('// summary: Updated the title')
  })

  it('strips existing refinement notes before appending', () => {
    const source = [
      'Text("Hello")',
      '',
      '// ship-fast-chat-refinement:1',
      '// instruction: old instruction',
      '// summary: old summary',
    ].join('\n')
    const result = appendOpenUiRefinementNote(
      source,
      'new instruction',
      'new summary',
      2,
    )
    expect(result).not.toContain('old instruction')
    expect(result).toContain('// ship-fast-chat-refinement:2')
    expect(result).toContain('// instruction: new instruction')
  })

  it('handles empty source', () => {
    const result = appendOpenUiRefinementNote('', 'instruction', 'summary', 1)
    expect(result).toBe(
      '// ship-fast-chat-refinement:1\n// instruction: instruction\n// summary: summary',
    )
  })

  it('sanitizes instruction and summary', () => {
    const result = appendOpenUiRefinementNote(
      'Text("Hi")',
      'instruction with   extra   spaces',
      'summary with */ close comment',
      1,
    )
    expect(result).toContain('// instruction: instruction with extra spaces')
    expect(result).toContain('// summary: summary with * / close comment')
  })
})

/* ------------------------------------------------------------------ */
/*  buildChatRefinedOpenUiSource                                       */
/* ------------------------------------------------------------------ */

describe('buildChatRefinedOpenUiSource', () => {
  it('returns undefined when source is undefined', () => {
    expect(
      buildChatRefinedOpenUiSource(undefined, 'instruction', 'summary', 1),
    ).toBeUndefined()
  })

  it('applies headline intent to OpenUI source', () => {
    const source = 'Text("Old Title")\nButton("Click")'
    const result = buildChatRefinedOpenUiSource(
      source,
      'Change the headline to "New Title"',
      'Updated headline',
      2,
    )
    expect(result).toContain('Text("New Title")')
    expect(result).toContain('// ship-fast-chat-refinement:2')
  })

  it('applies CTA intent to OpenUI source', () => {
    const source = 'Button("Old Button")'
    const result = buildChatRefinedOpenUiSource(
      source,
      'Change the CTA to "Buy Now"',
      'Updated CTA',
      1,
    )
    expect(result).toContain('Button("Buy Now")')
  })

  it('applies replace intent to OpenUI source', () => {
    const source = 'Text("Hello World")\nText("Other")'
    const result = buildChatRefinedOpenUiSource(
      source,
      'Replace "Hello World" with "Goodbye World"',
      'Replaced text',
      1,
    )
    expect(result).toContain('Goodbye World')
  })

  it('uses plan headline over instruction intent', () => {
    const source = 'Text("Old")'
    const plan: ChatRefinementPlan = { headline: 'Plan Title' }
    const result = buildChatRefinedOpenUiSource(
      source,
      'Change the headline to "Instruction Title"',
      'Summary',
      1,
      plan,
    )
    // The Text() call should use plan headline, not instruction's
    expect(result).toContain('Text("Plan Title")')
    // The instruction text appears in the appended refinement note, which is expected
  })

  it('uses plan ctaLabel over instruction intent', () => {
    const source = 'Button("Old")'
    const plan: ChatRefinementPlan = { ctaLabel: 'Plan CTA' }
    const result = buildChatRefinedOpenUiSource(
      source,
      'Change the button to "Instruction CTA"',
      'Summary',
      1,
      plan,
    )
    // The Button() call should use plan CTA, not instruction's
    expect(result).toContain('Button("Plan CTA")')
    // The instruction text appears in the appended refinement note, which is expected
  })

  it('applies plan replacements', () => {
    const source = 'Text("Hello World")'
    const plan: ChatRefinementPlan = {
      replacements: [{ oldText: 'Hello World', newText: 'Hi Earth' }],
    }
    const result = buildChatRefinedOpenUiSource(
      source,
      'fix text',
      'Fixed text',
      1,
      plan,
    )
    expect(result).toContain('Hi Earth')
  })

  it('strips existing refinement notes', () => {
    const source = [
      'Text("Hello")',
      '',
      '// ship-fast-chat-refinement:1',
      '// instruction: old',
      '// summary: old',
    ].join('\n')
    const result = buildChatRefinedOpenUiSource(
      source,
      'update something',
      'New summary',
      2,
    )
    expect(result).not.toContain('// ship-fast-chat-refinement:1')
    expect(result).toContain('// ship-fast-chat-refinement:2')
  })
})

/* ------------------------------------------------------------------ */
/*  replaceFirstMatchingJsonString                                     */
/* ------------------------------------------------------------------ */

describe('replaceFirstMatchingJsonString', () => {
  it('replaces the first matching key in a flat object', () => {
    const obj = { headline: 'Old', subtitle: 'Sub' }
    const result = replaceFirstMatchingJsonString(obj, /headline/i, 'New')
    expect(result.replaced).toBe(true)
    expect((result.value as Record<string, unknown>).headline).toBe('New')
    expect((result.value as Record<string, unknown>).subtitle).toBe('Sub')
  })

  it('only replaces the first matching key', () => {
    const obj = { title: 'First', heroTitle: 'Second' }
    const result = replaceFirstMatchingJsonString(obj, /title/i, 'Replaced')
    expect(result.replaced).toBe(true)
    expect((result.value as Record<string, unknown>).title).toBe('Replaced')
    expect((result.value as Record<string, unknown>).heroTitle).toBe('Second')
  })

  it('recurses into nested objects', () => {
    const obj = { hero: { heading: 'Old' } }
    const result = replaceFirstMatchingJsonString(obj, /heading/i, 'New')
    expect(result.replaced).toBe(true)
    expect(
      (
        (result.value as Record<string, unknown>).hero as Record<
          string,
          unknown
        >
      ).heading,
    ).toBe('New')
  })

  it('recurses into arrays', () => {
    const arr = [{ name: 'First' }, { name: 'Second' }]
    const result = replaceFirstMatchingJsonString(arr, /name/i, 'Replaced')
    expect(result.replaced).toBe(true)
    expect((result.value as Array<Record<string, unknown>>)[0].name).toBe(
      'Replaced',
    )
    expect((result.value as Array<Record<string, unknown>>)[1].name).toBe(
      'Second',
    )
  })

  it('returns replaced false when key pattern does not match', () => {
    const obj = { body: 'text' }
    const result = replaceFirstMatchingJsonString(obj, /headline/i, 'New')
    expect(result.replaced).toBe(false)
    expect((result.value as Record<string, unknown>).body).toBe('text')
  })

  it('does not replace non-string values', () => {
    const obj = { headline: 42 }
    const result = replaceFirstMatchingJsonString(obj, /headline/i, 'New')
    expect(result.replaced).toBe(false)
    expect((result.value as Record<string, unknown>).headline).toBe(42)
  })

  it('truncates replacement to 500 chars', () => {
    const obj = { title: 'Old' }
    const result = replaceFirstMatchingJsonString(
      obj,
      /title/i,
      'X'.repeat(600),
    )
    expect(result.replaced).toBe(true)
    expect(
      ((result.value as Record<string, unknown>).title as string).length,
    ).toBe(500)
  })

  it('handles primitive values by returning them unchanged', () => {
    const result = replaceFirstMatchingJsonString(
      'just a string',
      /title/i,
      'New',
    )
    expect(result.replaced).toBe(false)
    expect(result.value).toBe('just a string')
  })

  it('handles null by returning it unchanged', () => {
    const result = replaceFirstMatchingJsonString(null, /title/i, 'New')
    expect(result.replaced).toBe(false)
    expect(result.value).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/*  replaceFirstJsonText                                               */
/* ------------------------------------------------------------------ */

describe('replaceFirstJsonText', () => {
  it('replaces text within a string value', () => {
    const result = replaceFirstJsonText('Hello World', 'Hello', 'Hi')
    expect(result.replaced).toBe(true)
    expect(result.value).toBe('Hi World')
  })

  it('replaces first occurrence in a flat object', () => {
    const obj = { a: 'Hello World', b: 'Hello Again' }
    const result = replaceFirstJsonText(obj, 'Hello', 'Hi')
    expect(result.replaced).toBe(true)
    expect((result.value as Record<string, unknown>).a).toBe('Hi World')
    expect((result.value as Record<string, unknown>).b).toBe('Hello Again')
  })

  it('replaces first occurrence in an array', () => {
    const arr = ['Hello World', 'Hello Again']
    const result = replaceFirstJsonText(arr, 'Hello', 'Hi')
    expect(result.replaced).toBe(true)
    expect((result.value as string[])[0]).toBe('Hi World')
    expect((result.value as string[])[1]).toBe('Hello Again')
  })

  it('recurses into nested objects', () => {
    const obj = { nested: { text: 'Find Me Here' } }
    const result = replaceFirstJsonText(obj, 'Find Me', 'Found You')
    expect(result.replaced).toBe(true)
    expect(
      (
        (result.value as Record<string, unknown>).nested as Record<
          string,
          unknown
        >
      ).text,
    ).toBe('Found You Here')
  })

  it('returns replaced false when text is not found', () => {
    const obj = { a: 'No match' }
    const result = replaceFirstJsonText(obj, 'Missing', 'X')
    expect(result.replaced).toBe(false)
  })

  it('handles non-object non-string primitives', () => {
    expect(replaceFirstJsonText(42, 'foo', 'bar')).toEqual({
      value: 42,
      replaced: false,
    })
    expect(replaceFirstJsonText(null, 'foo', 'bar')).toEqual({
      value: null,
      replaced: false,
    })
    expect(replaceFirstJsonText(true, 'foo', 'bar')).toEqual({
      value: true,
      replaced: false,
    })
  })
})

/* ------------------------------------------------------------------ */
/*  appendChatRefinementToSiteSpec                                     */
/* ------------------------------------------------------------------ */

describe('appendChatRefinementToSiteSpec', () => {
  it('appends a refinement entry to a spec without existing refinements', () => {
    const spec = { name: 'MySite' }
    const result = appendChatRefinementToSiteSpec(
      spec,
      'instruction',
      'summary',
      1,
      1000,
    )
    expect(result.name).toBe('MySite')
    expect(result.shipFastChatRefinements).toHaveLength(1)
    expect(
      (result.shipFastChatRefinements as Array<Record<string, unknown>>)[0],
    ).toEqual({
      instruction: 'instruction',
      summary: 'summary',
      previewVersion: 1,
      createdAt: 1000,
    })
  })

  it('appends to existing refinements', () => {
    const spec = {
      shipFastChatRefinements: [
        { instruction: 'old', summary: 's', previewVersion: 1, createdAt: 500 },
      ],
    }
    const result = appendChatRefinementToSiteSpec(
      spec,
      'new',
      'new summary',
      2,
      1000,
    )
    expect((result.shipFastChatRefinements as unknown[]).length).toBe(2)
  })

  it('caps history at 25 entries (keeps last 24 + new)', () => {
    const existing = Array.from({ length: 30 }, (_, i) => ({
      instruction: `inst${i}`,
      summary: `sum${i}`,
      previewVersion: i,
      createdAt: i * 100,
    }))
    const spec = { shipFastChatRefinements: existing }
    const result = appendChatRefinementToSiteSpec(
      spec,
      'newest',
      'newest summary',
      31,
      5000,
    )
    expect((result.shipFastChatRefinements as unknown[]).length).toBe(25)
  })

  it('truncates instruction to 1000 chars', () => {
    const spec = {}
    const longInstruction = 'I'.repeat(1200)
    const result = appendChatRefinementToSiteSpec(
      spec,
      longInstruction,
      'sum',
      1,
      100,
    )
    const entry = (
      result.shipFastChatRefinements as Array<Record<string, unknown>>
    )[0]
    expect((entry.instruction as string).length).toBe(1000)
  })

  it('handles non-array existing shipFastChatRefinements', () => {
    const spec = { shipFastChatRefinements: 'not an array' }
    const result = appendChatRefinementToSiteSpec(spec, 'inst', 'sum', 1, 100)
    expect((result.shipFastChatRefinements as unknown[]).length).toBe(1)
  })
})

/* ------------------------------------------------------------------ */
/*  buildChatRefinedSiteSpecJson                                       */
/* ------------------------------------------------------------------ */

describe('buildChatRefinedSiteSpecJson', () => {
  it('returns undefined for undefined specJson', () => {
    expect(
      buildChatRefinedSiteSpecJson(undefined, 'inst', 'sum', 1, 100),
    ).toBeUndefined()
  })

  it('returns original string for unparseable JSON', () => {
    expect(buildChatRefinedSiteSpecJson('{bad', 'inst', 'sum', 1, 100)).toBe(
      '{bad',
    )
  })

  it('returns original string when parsed value is not an object', () => {
    expect(
      buildChatRefinedSiteSpecJson('"string"', 'inst', 'sum', 1, 100),
    ).toBe('"string"')
  })

  it('applies headline intent to site spec', () => {
    const spec = { headline: 'Old Headline' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Change the headline to "New Headline"',
      'Updated headline',
      1,
      100,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.headline).toBe('New Headline')
    expect(parsed.shipFastChatRefinements).toHaveLength(1)
  })

  it('applies CTA intent to site spec', () => {
    const spec = { ctaLabel: 'Old Button' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Change the CTA to "New Button"',
      'Updated CTA',
      1,
      100,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.ctaLabel).toBe('New Button')
  })

  it('applies replace intent to site spec', () => {
    const spec = { description: 'Hello World is great' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Replace "Hello World" with "Goodbye World"',
      'Replaced text',
      1,
      100,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.description).toBe('Goodbye World is great')
  })

  it('applies plan replacements over instruction intent', () => {
    const spec = { headline: 'Old', description: 'Some text' }
    const plan: ChatRefinementPlan = {
      replacements: [{ oldText: 'Some text', newText: 'New text' }],
    }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'update stuff',
      'Updated',
      1,
      100,
      plan,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.description).toBe('New text')
  })

  it('applies plan headline over instruction headline', () => {
    const spec = { headline: 'Old' }
    const plan: ChatRefinementPlan = { headline: 'Plan Headline' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Change headline to "Instruction Headline"',
      'Updated',
      1,
      100,
      plan,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.headline).toBe('Plan Headline')
  })

  it('applies plan ctaLabel over instruction CTA', () => {
    const spec = { buttonLabel: 'Old' }
    const plan: ChatRefinementPlan = { ctaLabel: 'Plan CTA' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Change CTA to "Inst CTA"',
      'Updated',
      1,
      100,
      plan,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.buttonLabel).toBe('Plan CTA')
  })

  it('appends refinement history entry', () => {
    const spec = { title: 'Site' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'some instruction',
      'did something',
      3,
      12345,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.shipFastChatRefinements).toHaveLength(1)
    expect(parsed.shipFastChatRefinements[0]).toEqual({
      instruction: 'some instruction',
      summary: 'did something',
      previewVersion: 3,
      createdAt: 12345,
    })
  })

  it('handles note intent by just appending refinement history', () => {
    const spec = { content: 'unchanged' }
    const result = buildChatRefinedSiteSpecJson(
      JSON.stringify(spec),
      'Make it more colorful',
      'Noted request',
      1,
      100,
    )
    const parsed = JSON.parse(result!)
    expect(parsed.content).toBe('unchanged')
    expect(parsed.shipFastChatRefinements).toHaveLength(1)
  })
})
