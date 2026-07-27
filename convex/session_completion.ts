'use node'

import { internalAction } from './_generated/server'
import {
  completeGenerationAction,
  type CompleteGenerationActionResult,
} from './lib/session_generation_action_helpers'
import { sessionInternalReferences } from './lib/session_internal_references'
import { completeGenerationArgs } from './lib/session_validators'

export const completeGeneration = internalAction({
  args: completeGenerationArgs,
  handler: async (ctx, args): Promise<CompleteGenerationActionResult> =>
    await completeGenerationAction(ctx, args, {
      getGenerationSession: sessionInternalReferences.getGenerationSession,
      completeGenerationInternal:
        sessionInternalReferences.completeGenerationInternal,
    }),
})
