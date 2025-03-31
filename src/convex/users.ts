
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Function to create a new user
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: `${args.firstName} ${args.lastName}`.trim(),
      createdAt: Date.now(),
    });

    // Create default free subscription
    await ctx.db.insert("subscriptions", {
      userId: args.clerkId,
      plan: "free",
      startDate: Date.now(),
      endDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
      status: "active",
    });

    return userId;
  },
});

// Function to get a user by their Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Get user's subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();

    return {
      ...user,
      subscription,
    };
  },
});
