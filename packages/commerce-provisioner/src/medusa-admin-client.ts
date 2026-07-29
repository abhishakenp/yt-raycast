// Thin client for the parts of Medusa's documented Admin REST API that
// store-creation needs: a sales channel, a publishable API key scoped to it,
// and linking the two. This targets one already-running customer Medusa
// instance (backendUrl) using an already-obtained admin bearer token — this
// module does not perform admin login. How the provisioner obtains that
// token for a freshly created stack (a seeded service admin user, most
// likely) is a stack-bootstrapping detail that belongs in the Dokploy/Swarm
// adapter, not here.
//
// Unlike the Dokploy/Swarm side, Medusa's Admin REST API shape is public,
// versioned, and stable, so this client is implemented for real (not
// stubbed) and covered by fetch-mock tests.

export type MedusaAdminClientConfig = {
  backendUrl: string
  adminApiToken: string
}

export type CreateStoreSalesChannelResult = {
  salesChannelId: string
  publishableKeyId: string
  publishableKey: string
}

export class MedusaAdminApiError extends Error {
  status: number
  constructor(operation: string, status: number, body: string) {
    super(`Medusa Admin API ${operation} failed with ${status}: ${body}`)
    this.status = status
  }
}

async function medusaAdminFetch(
  config: MedusaAdminClientConfig,
  path: string,
  init: RequestInit,
  operation: string,
): Promise<unknown> {
  const response = await fetch(`${config.backendUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.adminApiToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const bodyText = await response.text()
  if (!response.ok) {
    throw new MedusaAdminApiError(operation, response.status, bodyText)
  }
  return bodyText.length > 0 ? JSON.parse(bodyText) : {}
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

// Idempotent: reuses an existing sales channel with the same name instead of
// creating a duplicate on retry (mirrors the medusa-backend bootstrap.ts
// pattern of "find by name, else create").
export async function ensureStoreSalesChannelAndPublishableKey(
  config: MedusaAdminClientConfig,
  storeName: string,
): Promise<CreateStoreSalesChannelResult> {
  const existingChannels = asRecord(
    await medusaAdminFetch(
      config,
      `/admin/sales-channels?name=${encodeURIComponent(storeName)}`,
      { method: 'GET' },
      'list sales channels',
    ),
  )
  const existingChannelList = Array.isArray(existingChannels.sales_channels)
    ? existingChannels.sales_channels
    : []
  const existingChannel = asRecord(existingChannelList[0])

  const channel =
    typeof existingChannel.id === 'string'
      ? existingChannel
      : asRecord(
          asRecord(
            await medusaAdminFetch(
              config,
              '/admin/sales-channels',
              {
                method: 'POST',
                body: JSON.stringify({ name: storeName }),
              },
              'create sales channel',
            ),
          ).sales_channel,
        )

  const channelId = String(channel.id)

  const existingKeys = asRecord(
    await medusaAdminFetch(
      config,
      `/admin/api-keys?title=${encodeURIComponent(storeName)}&type=publishable`,
      { method: 'GET' },
      'list publishable keys',
    ),
  )
  const existingKeyList = Array.isArray(existingKeys.api_keys)
    ? existingKeys.api_keys
    : []
  const existingKey = asRecord(existingKeyList[0])

  const key =
    typeof existingKey.id === 'string'
      ? existingKey
      : asRecord(
          asRecord(
            await medusaAdminFetch(
              config,
              '/admin/api-keys',
              {
                method: 'POST',
                body: JSON.stringify({
                  title: storeName,
                  type: 'publishable',
                }),
              },
              'create publishable key',
            ),
          ).api_key,
        )

  const keyId = String(key.id)

  await medusaAdminFetch(
    config,
    `/admin/api-keys/${keyId}/sales-channels`,
    {
      method: 'POST',
      body: JSON.stringify({ add: [channelId] }),
    },
    'link publishable key to sales channel',
  )

  return {
    salesChannelId: channelId,
    publishableKeyId: keyId,
    publishableKey: String(key.token),
  }
}
