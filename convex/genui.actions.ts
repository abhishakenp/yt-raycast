"use node"

import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateUI } from "@ship-fast/engine/genui/orchestrator.ts"
import { DEFAULT_MODEL } from "@ship-fast/engine/genui/model-list.ts";
import { api } from "./_generated/api";

// Start GenUI generation for a session
export const startGeneration = action({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, prompt } = args;
    const startedAt = Date.now();

    // Update session status to generating
    await ctx.runMutation(api.genui.updateGenUIResults, {
      sessionId,
      status: "generating",
    });

    try {
      // Run the orchestrator and update DB in real-time
      for await (const event of generateUI(prompt, DEFAULT_MODEL)) {
        switch (event.type) {
          case "status":
            // Update status message
            await ctx.runMutation(api.genui.updateGenUIResults, {
              sessionId,
              status: "generating",
            });
            break;
          case "skeleton":
            // Update skeleton immediately
            await ctx.runMutation(api.genui.updateGenUIResults, {
              sessionId,
              status: "generating",
              skeleton: event.text,
            });
            break;
          case "theme":
            // Update theme immediately
            await ctx.runMutation(api.genui.updateGenUIResults, {
              sessionId,
              status: "generating",
              theme: event.name,
            });
            break;
          case "module_start":
            // Track when a module starts generation
            await ctx.runMutation(api.genui.upsertModule, {
              sessionId,
              moduleId: event.id,
              text: "",
              failed: false,
              startedAt: Date.now(),
              completedAt: 0, // Will update when done
            });
            break;
          case "module":
            // Update module with generated text and completion time
            await ctx.runMutation(api.genui.upsertModule, {
              sessionId,
              moduleId: event.id,
              text: event.text,
              failed: event.failed || false,
              completedAt: Date.now(),
            });
            break;
          case "done":
            // Calculate total elapsed time and mark as done
            const elapsed = Date.now() - startedAt;
            await ctx.runMutation(api.genui.updateGenUIResults, {
              sessionId,
              status: "done",
              elapsed,
            });
            return { success: true, sessionId, elapsed };
          case "error":
            await ctx.runMutation(api.genui.updateGenUIResults, {
              sessionId,
              status: "failed",
              error: event.message,
            });
            return { success: false, error: event.message };
        }
      }

      return { success: true, sessionId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(api.genui.updateGenUIResults, {
        sessionId,
        status: "failed",
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },
});
