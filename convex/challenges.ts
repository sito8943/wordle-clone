import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import {
  CHALLENGE_SEEDS,
  LEGACY_CHALLENGE_CONDITION_KEY_ALIASES,
  isChallengeConditionKey,
} from "./data/challenges";

const SIMPLE_CHALLENGE_POINTS = 5;
const COMPLEX_CHALLENGE_POINTS = 15;
const WEEKLY_CHALLENGE_POINTS = 25;
const SEEDED_CONDITION_KEYS_BY_TYPE = {
  simple: new Set(
    CHALLENGE_SEEDS.filter((seed) => seed.type === "simple").map(
      (seed) => seed.conditionKey,
    ),
  ),
  complex: new Set(
    CHALLENGE_SEEDS.filter((seed) => seed.type === "complex").map(
      (seed) => seed.conditionKey,
    ),
  ),
  weekly: new Set(
    CHALLENGE_SEEDS.filter((seed) => seed.type === "weekly").map(
      (seed) => seed.conditionKey,
    ),
  ),
} as const;
const CHALLENGE_SEED_BY_CONDITION_KEY = new Map(
  CHALLENGE_SEEDS.map((seed) => [seed.conditionKey, seed] as const),
);
const toCanonicalConditionKey = (conditionKey: string): string =>
  LEGACY_CHALLENGE_CONDITION_KEY_ALIASES[conditionKey] ?? conditionKey;
const isSeededConditionKeyForType = (
  type: "simple" | "complex" | "weekly",
  conditionKey: string,
): boolean => {
  const canonicalConditionKey = toCanonicalConditionKey(conditionKey);
  if (!isChallengeConditionKey(canonicalConditionKey)) {
    return false;
  }

  return SEEDED_CONDITION_KEYS_BY_TYPE[type].has(canonicalConditionKey);
};

const getUnusedByType = async (
  ctx: MutationCtx,
  type: "simple" | "complex" | "weekly",
) => {
  const seededConditionKeys = SEEDED_CONDITION_KEYS_BY_TYPE[type];
  const challenges = await ctx.db
    .query("challenges")
    .withIndex("by_type_and_used", (q) => q.eq("type", type).eq("used", false))
    .collect();

  return challenges.filter((challenge) => {
    const canonicalConditionKey = toCanonicalConditionKey(
      challenge.conditionKey,
    );

    if (!isChallengeConditionKey(canonicalConditionKey)) {
      return false;
    }

    return seededConditionKeys.has(canonicalConditionKey);
  });
};

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const pickRandomPreferDifferent = <T extends { _id: string }>(
  items: T[],
  previousId?: string,
): T => {
  if (!previousId) {
    return pickRandom(items);
  }

  const withoutPrevious = items.filter((item) => item._id !== previousId);
  return pickRandom(withoutPrevious.length > 0 ? withoutPrevious : items);
};

const resetAllChallenges = async (ctx: MutationCtx) => {
  const all = await ctx.db.query("challenges").collect();
  for (const challenge of all) {
    await ctx.db.patch(challenge._id, { used: false });
  }
};

const resolveProfileByClientId = async (
  ctx: QueryCtx | MutationCtx,
  clientId: string,
) => {
  return ctx.db
    .query("scores")
    .withIndex("by_client_id", (q) => q.eq("clientId", clientId))
    .first();
};

const formatChallenge = (doc: {
  _id: string;
  name: string;
  description: string;
  type: string;
  conditionKey: string;
}) => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  type: doc.type,
  conditionKey: doc.conditionKey,
});

const toStoredChallengeType = (type: string): "simple" | "complex" =>
  type as "simple" | "complex";

const getReferencedChallengeIds = async (
  ctx: MutationCtx,
): Promise<Set<string>> => {
  const [dailyEntries, progressEntries] = await Promise.all([
    ctx.db.query("dailyChallenges").collect(),
    ctx.db.query("playerChallengeProgress").collect(),
  ]);
  const referencedIds = new Set<string>();

  for (const dailyEntry of dailyEntries) {
    referencedIds.add(dailyEntry.simpleChallengeId);
    referencedIds.add(dailyEntry.complexChallengeId);
  }

  for (const progressEntry of progressEntries) {
    referencedIds.add(progressEntry.challengeId);
  }

  return referencedIds;
};

const seedChallengesCatalog = async (ctx: MutationCtx) => {
  const existing = await ctx.db.query("challenges").collect();
  let inserted = 0;
  let updated = 0;
  let deleted = 0;

  // Validate parity: equal number of simple and complex
  const simpleCount = CHALLENGE_SEEDS.filter((c) => c.type === "simple").length;
  const complexCount = CHALLENGE_SEEDS.filter(
    (c) => c.type === "complex",
  ).length;

  if (simpleCount !== complexCount) {
    throw new Error(
      `Challenge seeds must have equal simple and complex counts. Got ${simpleCount} simple, ${complexCount} complex.`,
    );
  }

  const seededConditionKeys = new Set(
    CHALLENGE_SEEDS.map((seed) => seed.conditionKey),
  );
  const existingByConditionKey = new Map<string, (typeof existing)[number]>();
  const referencedChallengeIds = await getReferencedChallengeIds(ctx);
  const deleteIfUnreferenced = async (
    challengeId: (typeof existing)[number]["_id"],
  ): Promise<boolean> => {
    if (referencedChallengeIds.has(challengeId)) {
      return false;
    }

    await ctx.db.delete(challengeId);
    deleted += 1;
    return true;
  };

  for (const challenge of existing) {
    const canonicalConditionKey = toCanonicalConditionKey(
      challenge.conditionKey,
    );

    if (!isChallengeConditionKey(canonicalConditionKey)) {
      await deleteIfUnreferenced(challenge._id);
      continue;
    }

    if (!seededConditionKeys.has(canonicalConditionKey)) {
      await deleteIfUnreferenced(challenge._id);
      continue;
    }

    const canonicalSeed = CHALLENGE_SEED_BY_CONDITION_KEY.get(
      canonicalConditionKey,
    );
    if (!canonicalSeed) {
      await deleteIfUnreferenced(challenge._id);
      continue;
    }

    if (existingByConditionKey.has(canonicalConditionKey)) {
      await deleteIfUnreferenced(challenge._id);
      continue;
    }

    const metadataMismatch =
      challenge.name !== canonicalSeed.name ||
      challenge.description !== canonicalSeed.description ||
      challenge.type !== canonicalSeed.type;
    const keyMismatch = challenge.conditionKey !== canonicalConditionKey;

    if (metadataMismatch || keyMismatch) {
      await ctx.db.patch(challenge._id, {
        conditionKey: canonicalConditionKey,
        name: canonicalSeed.name,
        description: canonicalSeed.description,
        type: toStoredChallengeType(canonicalSeed.type),
      });
      updated += 1;
      existingByConditionKey.set(canonicalConditionKey, {
        ...challenge,
        ...canonicalSeed,
        conditionKey: canonicalConditionKey,
      });
      continue;
    }

    existingByConditionKey.set(canonicalConditionKey, challenge);
  }

  for (const seed of CHALLENGE_SEEDS) {
    const current = existingByConditionKey.get(seed.conditionKey);

    if (!current) {
      await ctx.db.insert("challenges", {
        name: seed.name,
        description: seed.description,
        type: toStoredChallengeType(seed.type),
        conditionKey: seed.conditionKey,
        used: false,
      });
      inserted += 1;
      continue;
    }

    if (
      current.name === seed.name &&
      current.description === seed.description &&
      current.type === seed.type
    ) {
      continue;
    }

    await ctx.db.patch(current._id, {
      name: seed.name,
      description: seed.description,
      type: toStoredChallengeType(seed.type),
    });
    updated += 1;
  }

  return {
    inserted,
    total: CHALLENGE_SEEDS.length,
    alreadySeeded: inserted === 0 && updated === 0 && deleted === 0,
  };
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
    if (
      !isSeededConditionKeyForType("simple", simple.conditionKey) ||
      !isSeededConditionKeyForType("complex", complex.conditionKey)
    ) {
      return null;
    }

    return {
      date: existing.date,
      simple: formatChallenge(simple),
      complex: formatChallenge(complex),
    };
  },
});

export const getPlayerChallengeProgress = query({
  args: {
    clientId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await resolveProfileByClientId(ctx, args.clientId);
    if (!profile) return [];

    return ctx.db
      .query("playerChallengeProgress")
      .withIndex("by_profile_and_date", (q) =>
        q.eq("profileId", profile._id).eq("date", args.date),
      )
      .collect();
  },
});

export const listAllChallenges = query({
  args: {},
  handler: async (ctx) => {
    const challenges = await ctx.db.query("challenges").collect();
    return challenges.map((challenge) => formatChallenge(challenge));
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
        if (simple) {
          await ctx.db.patch(simple._id, { used: false });
        }
        if (complex) {
          await ctx.db.patch(complex._id, { used: false });
        }
        await ctx.db.delete(existing._id);
      } else {
        const isStaleDailyPair =
          simple.type !== "simple" ||
          complex.type !== "complex" ||
          !isSeededConditionKeyForType("simple", simple.conditionKey) ||
          !isSeededConditionKeyForType("complex", complex.conditionKey);

        if (isStaleDailyPair) {
          await ctx.db.patch(simple._id, { used: false });
          await ctx.db.patch(complex._id, { used: false });
          await ctx.db.delete(existing._id);
        } else {
          return {
            date: existing.date,
            simple: formatChallenge(simple),
            complex: formatChallenge(complex),
          };
        }
      }
    }

    await seedChallengesCatalog(ctx);

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
      throw new Error("No challenges available. Run seedChallenges first.");
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
      simple: formatChallenge(simple),
      complex: formatChallenge(complex),
    };
  },
});

export const regenerateDailyChallenges = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    const previousSimpleId = existing?.simpleChallengeId;
    const previousComplexId = existing?.complexChallengeId;

    if (existing) {
      const previousSimple = await ctx.db.get(existing.simpleChallengeId);
      const previousComplex = await ctx.db.get(existing.complexChallengeId);

      if (previousSimple) {
        await ctx.db.patch(previousSimple._id, { used: false });
      }

      if (previousComplex) {
        await ctx.db.patch(previousComplex._id, { used: false });
      }

      await ctx.db.delete(existing._id);
    }

    await seedChallengesCatalog(ctx);

    let unusedSimple = await getUnusedByType(ctx, "simple");
    let unusedComplex = await getUnusedByType(ctx, "complex");

    if (unusedSimple.length === 0 || unusedComplex.length === 0) {
      await resetAllChallenges(ctx);
      unusedSimple = await getUnusedByType(ctx, "simple");
      unusedComplex = await getUnusedByType(ctx, "complex");
    }

    if (unusedSimple.length === 0 || unusedComplex.length === 0) {
      throw new Error("No challenges available. Run seedChallenges first.");
    }

    const simple = pickRandomPreferDifferent(unusedSimple, previousSimpleId);
    const complex = pickRandomPreferDifferent(unusedComplex, previousComplexId);

    await ctx.db.patch(simple._id, { used: true });
    await ctx.db.patch(complex._id, { used: true });

    await ctx.db.insert("dailyChallenges", {
      date: args.date,
      simpleChallengeId: simple._id,
      complexChallengeId: complex._id,
    });

    return {
      date: args.date,
      simple: formatChallenge(simple),
      complex: formatChallenge(complex),
    };
  },
});

export const completeChallenge = mutation({
  args: {
    clientId: v.string(),
    challengeId: v.id("challenges"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Resolve player profile from clientId
    const profile = await resolveProfileByClientId(ctx, args.clientId);
    if (!profile) {
      throw new Error("Player profile not found.");
    }

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }
    const challengeType = String(challenge.type);

    if (challengeType !== "weekly") {
      // Validate daily challenges for non-weekly challenge types.
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
    }

    // Check if already completed
    const existingProgress = await ctx.db
      .query("playerChallengeProgress")
      .withIndex("by_profile_and_challenge", (q) =>
        q.eq("profileId", profile._id).eq("challengeId", args.challengeId),
      )
      .collect();

    const alreadyCompleted = existingProgress.some(
      (p) => p.date === args.date && p.completed,
    );

    if (alreadyCompleted) {
      return { pointsAwarded: 0, alreadyCompleted: true };
    }

    const pointsAwarded =
      challengeType === "simple"
        ? SIMPLE_CHALLENGE_POINTS
        : challengeType === "complex"
          ? COMPLEX_CHALLENGE_POINTS
          : WEEKLY_CHALLENGE_POINTS;

    // Record progress
    await ctx.db.insert("playerChallengeProgress", {
      profileId: profile._id,
      challengeId: args.challengeId,
      date: args.date,
      completed: true,
      completedAt: Date.now(),
      pointsAwarded,
    });

    // Update player score
    const currentScore = profile.score ?? 0;
    await ctx.db.patch(profile._id, {
      score: currentScore + pointsAwarded,
    });

    return { pointsAwarded, alreadyCompleted: false };
  },
});

export const resetPlayerChallengeProgressForDate = mutation({
  args: {
    clientId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await resolveProfileByClientId(ctx, args.clientId);
    if (!profile) {
      throw new Error("Player profile not found.");
    }

    const entries = await ctx.db
      .query("playerChallengeProgress")
      .withIndex("by_profile_and_date", (q) =>
        q.eq("profileId", profile._id).eq("date", args.date),
      )
      .collect();

    const pointsReverted = entries.reduce(
      (total, entry) => total + (entry.completed ? entry.pointsAwarded : 0),
      0,
    );

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    if (pointsReverted > 0) {
      const currentScore = profile.score ?? 0;
      await ctx.db.patch(profile._id, {
        score: Math.max(0, currentScore - pointsReverted),
      });
    }

    return {
      resetCount: entries.length,
      pointsReverted,
    };
  },
});

export const seedChallenges = mutation({
  args: {},
  handler: async (ctx) => seedChallengesCatalog(ctx),
});
