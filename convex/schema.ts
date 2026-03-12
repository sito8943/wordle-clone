import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scores: defineTable({
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    score: v.number(),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_score", ["score"])
    .index("by_client_record_id", ["clientRecordId"]),
});
