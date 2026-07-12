import isEmpty from 'lodash/isEmpty'
import * as z from 'zod'

const appEnvSchema = z.object({
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  VITE_CONVEX_URL: z.string().url().optional(),
  VITE_CONVEX_SELF_HOSTED_URL: z.string().url().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CONVEX_URL: z.string().url().optional(),
  CONVEX_SELF_HOSTED_URL: z.string().url().optional(),
  CONVEX_SELF_HOSTED_ADMIN_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  SANITY_PROJECT_ID: z.string().optional(),
  MEDUSA_BACKEND_URL: z.string().url().optional(),
  MEDUSA_ADMIN_URL: z.string().url().optional(),
  MEDUSA_STOREFRONT_URL: z.string().url().optional(),
  MEDUSA_PUBLISHABLE_KEY: z.string().optional(),
  MEDUSA_PUBLISHABLE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: z.string().url().optional(),
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string().optional(),
  VITE_MEDUSA_BACKEND_URL: z.string().url().optional(),
  VITE_MEDUSA_PUBLISHABLE_KEY: z.string().optional(),
})

export type AppEnv = z.infer<typeof appEnvSchema>

export type RawAppEnv = Record<string, string | undefined>

export function parseAppEnv(rawEnv: RawAppEnv): AppEnv {
  return appEnvSchema.parse({
    APP_BASE_URL: rawEnv.APP_BASE_URL,
    VITE_CLERK_PUBLISHABLE_KEY: rawEnv.VITE_CLERK_PUBLISHABLE_KEY,
    VITE_CONVEX_URL: rawEnv.VITE_CONVEX_URL,
    VITE_CONVEX_SELF_HOSTED_URL: rawEnv.VITE_CONVEX_SELF_HOSTED_URL,
    CLERK_PUBLISHABLE_KEY: rawEnv.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: rawEnv.CLERK_SECRET_KEY,
    CONVEX_URL: rawEnv.CONVEX_URL,
    CONVEX_SELF_HOSTED_URL: rawEnv.CONVEX_SELF_HOSTED_URL,
    CONVEX_SELF_HOSTED_ADMIN_KEY: rawEnv.CONVEX_SELF_HOSTED_ADMIN_KEY,
    GROQ_API_KEY: rawEnv.GROQ_API_KEY,
    GEMINI_API_KEY: rawEnv.GEMINI_API_KEY,
    STRIPE_SECRET_KEY: rawEnv.STRIPE_SECRET_KEY,
    RAZORPAY_KEY_ID: rawEnv.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: rawEnv.RAZORPAY_KEY_SECRET,
    SANITY_PROJECT_ID: rawEnv.SANITY_PROJECT_ID,
    MEDUSA_BACKEND_URL: rawEnv.MEDUSA_BACKEND_URL,
    MEDUSA_ADMIN_URL: rawEnv.MEDUSA_ADMIN_URL,
    MEDUSA_STOREFRONT_URL: rawEnv.MEDUSA_STOREFRONT_URL,
    MEDUSA_PUBLISHABLE_KEY: rawEnv.MEDUSA_PUBLISHABLE_KEY,
    MEDUSA_PUBLISHABLE_API_KEY: rawEnv.MEDUSA_PUBLISHABLE_API_KEY,
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: rawEnv.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:
      rawEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    VITE_MEDUSA_BACKEND_URL: rawEnv.VITE_MEDUSA_BACKEND_URL,
    VITE_MEDUSA_PUBLISHABLE_KEY: rawEnv.VITE_MEDUSA_PUBLISHABLE_KEY,
  })
}

export function hasConfiguredValue(value: string | undefined): boolean {
  return !isEmpty(value?.trim())
}
