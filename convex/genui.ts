import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateUI } from "../src/genui/orchestrator";
import { DEFAULT_MODEL } from "../src/genui/model-list";
import { api } from "./_generated/api";

// Query to get a session by ID
export const getSession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

// Query to get modules for a session
export const getModules = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const modules = await ctx.db
      .query("genuiModules")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return modules;
  },
});

// Create a new session for GenUI generation
export const createSession = mutation({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      prompt: args.prompt,
      userId: args.userId,
      createdAt: Date.now(),
      workspace: "default",
      homepageReady: false,
      siteSpecReady: false,
      openuiReady: false,
      preferredExportTarget: "html",
      preferredLanguage: args.preferredLanguage || "en",
      isPrivate: false,
      genuiStatus: "pending",
    });
    return sessionId;
  },
});

// Mutation to update all GenUI fields at once
export const updateGenUIResults = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.string(),
    skeleton: v.optional(v.string()),
    theme: v.optional(v.string()),
    error: v.optional(v.string()),
    elapsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, status, skeleton, theme, error, elapsed } = args;
    const updates: any = { genuiStatus: status };
    if (skeleton !== undefined) updates.genuiSkeleton = skeleton;
    if (theme !== undefined) updates.genuiTheme = theme;
    if (error !== undefined) updates.genuiError = error;
    if (elapsed !== undefined) updates.elapsed = elapsed;
    await ctx.db.patch(sessionId, updates);
  },
});

// Mutation to insert a module record with timestamps
export const insertModule = mutation({
  args: {
    sessionId: v.id("sessions"),
    moduleId: v.string(),
    text: v.string(),
    failed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { sessionId, moduleId, text, failed, startedAt, completedAt } = args;
    await ctx.db.insert("genuiModules", {
      sessionId,
      moduleId,
      text,
      failed,
      startedAt,
      completedAt,
    });
  },
});

// Mutation to upsert a module record (insert or update)
export const upsertModule = mutation({
  args: {
    sessionId: v.id("sessions"),
    moduleId: v.string(),
    text: v.string(),
    failed: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { sessionId, moduleId, text, failed, startedAt, completedAt } = args;
    const existing = await ctx.db
      .query("genuiModules")
      .withIndex("by_sessionId_moduleId", (q) =>
        q.eq("sessionId", sessionId).eq("moduleId", moduleId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { text, failed, completedAt });
    } else {
      await ctx.db.insert("genuiModules", {
        sessionId,
        moduleId,
        text,
        failed,
        startedAt: startedAt ?? completedAt,
        completedAt,
      });
    }
  },
});

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
