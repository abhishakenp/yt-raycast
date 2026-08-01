import { OpenAIBaseChatCompletionsTextAdapter } from '@tanstack/openai-base'
import type { Modality } from '@tanstack/ai'
import OpenAI from 'openai'

const POLLINATIONS_BASE_URL = 'https://gen.pollinations.ai'

const getPollinationsApiKeyFromEnv = () => {
  const key = process.env.POLLINATIONS_API_KEY
  if (!key) {
    throw new Error('POLLINATIONS_API_KEY is not set')
  }
  return key
}

export class PollinationsTextAdapter<
  TModel extends string,
  TProviderOptions extends Record<string, unknown> = Record<string, unknown>,
  TInputModalities extends ReadonlyArray<Modality> = ReadonlyArray<Modality>,
> extends OpenAIBaseChatCompletionsTextAdapter<
  TModel,
  TProviderOptions,
  TInputModalities
> {
  override readonly kind = 'text' as const
  override readonly name = 'pollinations' as const

  constructor(apiKey: string, model: TModel) {
    super(
      model,
      'pollinations',
      new OpenAI({ apiKey, baseURL: POLLINATIONS_BASE_URL }),
    )
  }
}

export const pollinationsText = <TModel extends string>(model: TModel) =>
  new PollinationsTextAdapter(getPollinationsApiKeyFromEnv(), model)
