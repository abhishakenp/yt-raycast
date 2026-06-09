import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
