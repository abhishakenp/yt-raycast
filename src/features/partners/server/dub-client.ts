import { Dub } from 'dub'

// serverURL points the SDK at a self-hosted Dub (e.g. https://api.ship-fast.ai);
// omit it to use Dub SaaS (api.dub.co).
export function createDubServerClient(apiKey: string, serverURL?: string): Dub {
  return new Dub({ token: apiKey, ...(serverURL ? { serverURL } : {}) })
}
