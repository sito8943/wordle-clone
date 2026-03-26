import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scores: defineTable({
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    playerCode: v.optional(v.string()),
    language: v.optional(v.string()),
    score: v.number(),
    streak: v.optional(v.number()),
    scoreByLanguage: v.optional(
      v.object({
        en: v.optional(v.number()),
        es: v.optional(v.number()),
      }),
    ),
    streakByLanguage: v.optional(
      v.object({
        en: v.optional(v.number()),
        es: v.optional(v.number()),
      }),
    ),
    createdAtByLanguage: v.optional(
      v.object({
        en: v.optional(v.number()),
        es: v.optional(v.number()),
      }),
    ),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_client_id", ["clientId"])
    .index("by_created_at", ["createdAt"])
    .index("by_score", ["score"])
    .index("by_language", ["language"])
    .index("by_client_record_id", ["clientRecordId"])
    .index("by_player_code", ["playerCode"]),
  scoreEvents: defineTable({
    profileId: v.string(),
    eventId: v.string(),
    kind: v.string(),
    pointsDelta: v.optional(v.number()),
    happenedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_profile_id", ["profileId"])
    .index("by_event_id", ["eventId"]),
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
