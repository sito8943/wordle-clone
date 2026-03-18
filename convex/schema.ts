import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scores: defineTable({
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    playerCode: v.optional(v.string()),
    score: v.number(),
    streak: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_client_id", ["clientId"])
    .index("by_created_at", ["createdAt"])
    .index("by_score", ["score"])
    .index("by_client_record_id", ["clientRecordId"])
    .index("by_player_code", ["playerCode"]),
  words: defineTable({
    language: v.string(),
    value: v.string(),
    createdAt: v.number(),
  })
    .index("by_language", ["language"])
    .index("by_language_and_value", ["language", "value"]),
  wordsMeta: defineTable({
    language: v.string(),
    checksum: v.number(),
    updatedAt: v.number(),
  }).index("by_language", ["language"]),
});
