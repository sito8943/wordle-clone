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
    scoreByLanguageAndMode: v.optional(
      v.object({
        en: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
        es: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
      }),
    ),
    streakByLanguageAndMode: v.optional(
      v.object({
        en: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
        es: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
      }),
    ),
    createdAtByLanguageAndMode: v.optional(
      v.object({
        en: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
        es: v.optional(
          v.object({
            classic: v.optional(v.number()),
            lightning: v.optional(v.number()),
            daily: v.optional(v.number()),
          }),
        ),
      }),
    ),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
    tutorialPromptSeenModes: v.optional(
      v.object({
        classic: v.optional(v.boolean()),
        lightning: v.optional(v.boolean()),
        zen: v.optional(v.boolean()),
        daily: v.optional(v.boolean()),
      }),
    ),
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
    version: v.optional(v.number()),
    clientPointsDelta: v.optional(v.number()),
    pointsDelta: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    modeId: v.optional(v.string()),
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
  challenges: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("simple"),
      v.literal("complex"),
      v.literal("weekly"),
    ),
    conditionKey: v.string(),
    used: v.boolean(),
  })
    .index("by_type", ["type"])
    .index("by_type_and_used", ["type", "used"]),
  dailyChallenges: defineTable({
    date: v.string(),
    simpleChallengeId: v.id("challenges"),
    complexChallengeId: v.id("challenges"),
  }).index("by_date", ["date"]),
  playerChallengeProgress: defineTable({
    profileId: v.id("scores"),
    challengeId: v.id("challenges"),
    date: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    pointsAwarded: v.number(),
  })
    .index("by_profile_and_date", ["profileId", "date"])
    .index("by_profile_and_challenge", ["profileId", "challengeId"]),
});
