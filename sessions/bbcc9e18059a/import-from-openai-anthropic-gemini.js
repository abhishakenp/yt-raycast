<ChatThread[]>
//
// Each ChatThread returned should contain:
//   - externalId: string (the provider's unique thread identifier)
//   - title?: string
//   - createdAt: Date
//   - messages: Message[]
//
// Each Message should contain:
//   - externalId?: string
//   - role: 'assistant' | 'user' | 'system'
//   - content: string
//   - createdAt: Date
//   - attachments?: Attachment[]
//
// The services are responsible for:
//   1. Authenticating with the provider using the supplied apiKey.
//   2. Paging through the provider's conversation history.
//   3. Normalising the data into the above shape.
//   4. Respecting the optional `limit` parameter.
//
// ------------------------------------------------------------------------- */