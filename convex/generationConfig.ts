const isGroqModel = (model: string): boolean =>
  !/^gemini[-/]/i.test(model.trim())

export const getModelConfigurationFailure = (): string | null => {
  const homepageModel = (
    process.env.OPENUI_HOME_MODEL ||
    process.env.HOMEPAGE_MODEL ||
    process.env.GROQ_MODEL ||
    'openai/gpt-oss-120b'
  ).trim()

  if (isGroqModel(homepageModel) && !process.env.GROQ_API_KEY?.trim()) {
    return 'Model API unavailable: GROQ_API_KEY is missing. Add it to Doppler or .env, restart the dev server, and generate again.'
  }

  if (
    !isGroqModel(homepageModel) &&
    !process.env.GEMINI_API_KEY?.trim() &&
    !process.env.GOOGLE_API_KEY?.trim()
  ) {
    return 'Model API unavailable: GEMINI_API_KEY or GOOGLE_API_KEY is missing. Add it to Doppler or .env, restart the dev server, and generate again.'
  }

  return null
}
