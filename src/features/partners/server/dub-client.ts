import { Dub } from 'dub'

export function createDubServerClient(apiKey: string): Dub {
  return new Dub({ token: apiKey })
}
