
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store additional user data beyond what Clerk provides
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  
  // Documents table for storing text content for plagiarism checks
  documents: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // Analysis results for storing plagiarism and AI detection results
  analysisResults: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    type: v.string(), // "plagiarism" or "ai_detection" or "humanization"
    result: v.any(), // Will store the analysis results as JSON
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),
  
  // User subscriptions for tracking subscription status
  subscriptions: defineTable({
    userId: v.string(),
    plan: v.string(), // "free", "basic", "premium"
    startDate: v.number(),
    endDate: v.number(),
    status: v.string(), // "active", "canceled", "expired"
  }).index("by_user", ["userId"]),
});
