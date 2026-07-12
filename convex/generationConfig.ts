function isGroqModel(model: string): boolean {
  return !/^gemini[-/]/i.test(model.trim())
}

const modelConfigurationHelp =
  'Configure it in Convex/Doppler environment variables, redeploy if needed, and generate again.'

export function getModelConfigurationFailure(): string | null {
  const homepageModel = (
    process.env.OPENUI_HOME_MODEL ||
    process.env.HOMEPAGE_MODEL ||
    process.env.GROQ_MODEL ||
    'openai/gpt-oss-120b'
  ).trim()

  if (isGroqModel(homepageModel) && !process.env.GROQ_API_KEY?.trim()) {
    return `Model API unavailable: GROQ_API_KEY is missing. ${modelConfigurationHelp}`
  }

  if (
    !isGroqModel(homepageModel) &&
    !process.env.GEMINI_API_KEY?.trim() &&
    !process.env.GOOGLE_API_KEY?.trim()
  ) {
    return `Model API unavailable: GEMINI_API_KEY or GOOGLE_API_KEY is missing. ${modelConfigurationHelp}`
  }

  return null
}
