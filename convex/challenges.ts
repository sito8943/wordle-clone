import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { CHALLENGE_SEEDS } from "./data/challenges";

const SIMPLE_CHALLENGE_POINTS = 5;
const COMPLEX_CHALLENGE_POINTS = 15;

const getUnusedByType = async (
  ctx: MutationCtx,
  type: "simple" | "complex",
) => {
  return ctx.db
    .query("challenges")
    .withIndex("by_type_and_used", (q) => q.eq("type", type).eq("used", false))
    .collect();
};

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const resetAllChallenges = async (ctx: MutationCtx) => {
  const all = await ctx.db.query("challenges").collect();
  for (const challenge of all) {
    await ctx.db.patch(challenge._id, { used: false });
  }
};

// --- Queries ---

export const getTodayChallenges = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    if (!existing) return null;

    const simple = await ctx.db.get(existing.simpleChallengeId);
    const complex = await ctx.db.get(existing.complexChallengeId);

    if (!simple || !complex) return null;

    return {
      date: existing.date,
      simple: {
        id: simple._id,
        name: simple.name,
        description: simple.description,
        type: simple.type,
        conditionKey: simple.conditionKey,
      },
      complex: {
        id: complex._id,
        name: complex.name,
        description: complex.description,
        type: complex.type,
        conditionKey: complex.conditionKey,
      },
    };
  },
});

export const getPlayerChallengeProgress = query({
  args: {
    profileId: v.id("scores"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("playerChallengeProgress")
      .withIndex("by_profile_and_date", (q) =>
        q.eq("profileId", args.profileId).eq("date", args.date),
      )
      .collect();
  },
});

export const listAllChallenges = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("challenges").collect();
  },
});

// --- Mutations ---

export const generateDailyChallenges = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    // Idempotent: return existing if already generated for this date
    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    if (existing) {
      const simple = await ctx.db.get(existing.simpleChallengeId);
      const complex = await ctx.db.get(existing.complexChallengeId);

      if (!simple || !complex) {
        throw new Error("Daily challenges reference missing challenge records.");
      }

      return {
        date: existing.date,
        simple: {
          id: simple._id,
          name: simple.name,
          description: simple.description,
          type: simple.type,
          conditionKey: simple.conditionKey,
        },
        complex: {
          id: complex._id,
          name: complex.name,
          description: complex.description,
          type: complex.type,
          conditionKey: complex.conditionKey,
        },
      };
    }

    // Find unused challenges of each type
    let unusedSimple = await getUnusedByType(ctx, "simple");
    let unusedComplex = await getUnusedByType(ctx, "complex");

    // If either type is exhausted, reset all challenges
    if (unusedSimple.length === 0 || unusedComplex.length === 0) {
      await resetAllChallenges(ctx);
      unusedSimple = await getUnusedByType(ctx, "simple");
      unusedComplex = await getUnusedByType(ctx, "complex");
    }

    if (unusedSimple.length === 0 || unusedComplex.length === 0) {
      throw new Error(
        "No challenges available. Run seedChallenges first.",
      );
    }

    const simple = pickRandom(unusedSimple);
    const complex = pickRandom(unusedComplex);

    // Mark as used
    await ctx.db.patch(simple._id, { used: true });
    await ctx.db.patch(complex._id, { used: true });

    // Create daily entry
    await ctx.db.insert("dailyChallenges", {
      date: args.date,
      simpleChallengeId: simple._id,
      complexChallengeId: complex._id,
    });

    return {
      date: args.date,
      simple: {
        id: simple._id,
        name: simple.name,
        description: simple.description,
        type: simple.type,
        conditionKey: simple.conditionKey,
      },
      complex: {
        id: complex._id,
        name: complex.name,
        description: complex.description,
        type: complex.type,
        conditionKey: complex.conditionKey,
      },
    };
  },
});

export const completeChallenge = mutation({
  args: {
    profileId: v.id("scores"),
    challengeId: v.id("challenges"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate the challenge exists and belongs to today
    const dailyChallenges = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    if (!dailyChallenges) {
      throw new Error("No daily challenges found for this date.");
    }

    const isTodayChallenge =
      dailyChallenges.simpleChallengeId === args.challengeId ||
      dailyChallenges.complexChallengeId === args.challengeId;

    if (!isTodayChallenge) {
      throw new Error("This challenge does not belong to today's daily set.");
    }

    // Check if already completed
    const existingProgress = await ctx.db
      .query("playerChallengeProgress")
      .withIndex("by_profile_and_challenge", (q) =>
        q.eq("profileId", args.profileId).eq("challengeId", args.challengeId),
      )
      .collect();

    const alreadyCompleted = existingProgress.some(
      (p) => p.date === args.date && p.completed,
    );

    if (alreadyCompleted) {
      return { pointsAwarded: 0, alreadyCompleted: true };
    }

    // Determine points based on challenge type
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }

    const pointsAwarded =
      challenge.type === "simple"
        ? SIMPLE_CHALLENGE_POINTS
        : COMPLEX_CHALLENGE_POINTS;

    // Record progress
    await ctx.db.insert("playerChallengeProgress", {
      profileId: args.profileId,
      challengeId: args.challengeId,
      date: args.date,
      completed: true,
      completedAt: Date.now(),
      pointsAwarded,
    });

    // Update player score
    const profile = await ctx.db.get(args.profileId);
    if (profile) {
      const currentScore = profile.score ?? 0;
      await ctx.db.patch(args.profileId, {
        score: currentScore + pointsAwarded,
      });
    }

    return { pointsAwarded, alreadyCompleted: false };
  },
});

export const seedChallenges = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("challenges").collect();

    if (existing.length > 0) {
      return { inserted: 0, total: existing.length, alreadySeeded: true };
    }

    // Validate parity: equal number of simple and complex
    const simpleCount = CHALLENGE_SEEDS.filter(
      (c) => c.type === "simple",
    ).length;
    const complexCount = CHALLENGE_SEEDS.filter(
      (c) => c.type === "complex",
    ).length;

    if (simpleCount !== complexCount) {
      throw new Error(
        `Challenge seeds must have equal simple and complex counts. Got ${simpleCount} simple, ${complexCount} complex.`,
      );
    }

    for (const seed of CHALLENGE_SEEDS) {
      await ctx.db.insert("challenges", {
        name: seed.name,
        description: seed.description,
        type: seed.type,
        conditionKey: seed.conditionKey,
        used: false,
      });
    }

    return {
      inserted: CHALLENGE_SEEDS.length,
      total: CHALLENGE_SEEDS.length,
      alreadySeeded: false,
    };
  },
});
