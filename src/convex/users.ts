
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Store user data when a new user signs up via Clerk
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create a new user record
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: `${args.firstName || ""} ${args.lastName || ""}`.trim(),
      createdAt: Date.now(),
    });

    // Also create a free subscription for the new user
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

// Get the current user's data by their Clerk ID
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

    // Get the user's subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();

    return {
      ...user,
      subscription: subscription || { plan: "free", status: "inactive" },
    };
  },
});

// Get all users (admin only function in the future)
export const getAllUsers = query({
  handler: async (ctx) => {
    // In a real app, you would add authorization here
    return await ctx.db.query("users").collect();
  },
});
