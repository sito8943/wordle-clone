import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const MAX_NICK_LENGTH = 30;

const normalizeNick = (value: string): string => {
  const trimmed = value.trim().slice(0, MAX_NICK_LENGTH);
  return trimmed || "Player";
};

const nickKey = (value: string): string => normalizeNick(value).toLowerCase();

const scoreSorter = (
  a: { score: number; createdAt: number },
  b: { score: number; createdAt: number },
) => {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  return a.createdAt - b.createdAt;
};

type ScoreRecord = {
  _id: string;
  nick: string;
  clientId?: string;
};

const NAME_UNAVAILABLE_ERROR = "Name is not available.";

const hasNickConflict = (
  scores: ScoreRecord[],
  normalizedNick: string,
  clientId?: string,
  ignoreId?: string,
): boolean => {
  const requestedKey = nickKey(normalizedNick);

  return scores.some((entry) => {
    if (entry._id === ignoreId) {
      return false;
    }

    if (nickKey(entry.nick) !== requestedKey) {
      return false;
    }

    if (clientId && entry.clientId === clientId) {
      return false;
    }

    return true;
  });
};

const assertNickAvailable = (
  scores: ScoreRecord[],
  normalizedNick: string,
  clientId?: string,
  ignoreId?: string,
): void => {
  if (hasNickConflict(scores, normalizedNick, clientId, ignoreId)) {
    throw new Error(NAME_UNAVAILABLE_ERROR);
  }
};

export const addScore = mutation({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    score: v.number(),
    streak: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const score = Math.max(0, Math.floor(args.score));
    const streak = Math.max(0, Math.floor(args.streak ?? 0));
    const createdAt = args.createdAt ?? Date.now();

    if (args.clientRecordId) {
      const existing = await ctx.db
        .query("scores")
        .withIndex("by_client_record_id", (query) =>
          query.eq("clientRecordId", args.clientRecordId),
        )
        .first();

      if (existing) {
        const scores = (await ctx.db
          .query("scores")
          .collect()) as ScoreRecord[];
        assertNickAvailable(
          scores,
          nick,
          args.clientId ?? existing.clientId,
          existing._id,
        );

        const nextScore = Math.max(existing.score, score);
        const nextCreatedAt =
          nextScore > existing.score ? createdAt : existing.createdAt;
        const nextStreak = streak;
        const nextClientId = args.clientId ?? existing.clientId;

        if (
          existing.nick !== nick ||
          existing.score !== nextScore ||
          (existing.streak ?? 0) !== nextStreak ||
          existing.createdAt !== nextCreatedAt ||
          existing.clientId !== nextClientId
        ) {
          await ctx.db.patch(existing._id, {
            clientId: nextClientId,
            nick,
            score: nextScore,
            streak: nextStreak,
            createdAt: nextCreatedAt,
          });
        }

        return existing._id;
      }
    }

    if (args.clientId) {
      const existingForClient = await ctx.db
        .query("scores")
        .withIndex("by_client_id", (query) =>
          query.eq("clientId", args.clientId),
        )
        .first();
      const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
      assertNickAvailable(scores, nick, args.clientId, existingForClient?._id);

      if (existingForClient) {
        const nextScore = Math.max(existingForClient.score, score);
        const nextCreatedAt =
          nextScore > existingForClient.score
            ? createdAt
            : existingForClient.createdAt;
        const nextStreak = streak;
        const nextClientRecordId =
          args.clientRecordId ?? existingForClient.clientRecordId;

        if (
          existingForClient.nick !== nick ||
          existingForClient.score !== nextScore ||
          (existingForClient.streak ?? 0) !== nextStreak ||
          existingForClient.createdAt !== nextCreatedAt ||
          existingForClient.clientRecordId !== nextClientRecordId
        ) {
          await ctx.db.patch(existingForClient._id, {
            nick,
            score: nextScore,
            streak: nextStreak,
            createdAt: nextCreatedAt,
            clientRecordId: nextClientRecordId,
          });
        }

        return existingForClient._id;
      }

      return ctx.db.insert("scores", {
        clientId: args.clientId,
        clientRecordId: args.clientRecordId,
        nick,
        score,
        streak,
        createdAt,
      });
    }

    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    assertNickAvailable(scores, nick);

    return ctx.db.insert("scores", {
      clientRecordId: args.clientRecordId,
      nick,
      score,
      streak,
      createdAt,
    });
  },
});

export const updateScore = mutation({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    score: v.number(),
    streak: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const score = Math.max(0, Math.floor(args.score));
    const streak = Math.max(0, Math.floor(args.streak ?? 0));
    const createdAt = args.createdAt ?? Date.now();

    if (args.clientRecordId) {
      const existing = await ctx.db
        .query("scores")
        .withIndex("by_client_record_id", (query) =>
          query.eq("clientRecordId", args.clientRecordId),
        )
        .first();

      if (existing) {
        const scores = (await ctx.db
          .query("scores")
          .collect()) as ScoreRecord[];
        assertNickAvailable(
          scores,
          nick,
          args.clientId ?? existing.clientId,
          existing._id,
        );

        const nextScore = score;
        const nextCreatedAt = createdAt;
        const nextStreak = streak;
        const nextClientId = args.clientId ?? existing.clientId;

        if (
          existing.nick !== nick ||
          existing.score !== nextScore ||
          (existing.streak ?? 0) !== nextStreak ||
          existing.createdAt !== nextCreatedAt ||
          existing.clientId !== nextClientId
        ) {
          await ctx.db.patch(existing._id, {
            clientId: nextClientId,
            nick,
            score: nextScore,
            streak: nextStreak,
            createdAt: nextCreatedAt,
          });
        }

        return existing._id;
      }
    }

    if (args.clientId) {
      const existingForClient = await ctx.db
        .query("scores")
        .withIndex("by_client_id", (query) =>
          query.eq("clientId", args.clientId),
        )
        .first();
      const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
      assertNickAvailable(scores, nick, args.clientId, existingForClient?._id);

      if (existingForClient) {
        const nextScore = score;
        const nextCreatedAt = createdAt;
        const nextStreak = streak;
        const nextClientRecordId =
          args.clientRecordId ?? existingForClient.clientRecordId;

        if (
          existingForClient.nick !== nick ||
          existingForClient.score !== nextScore ||
          (existingForClient.streak ?? 0) !== nextStreak ||
          existingForClient.createdAt !== nextCreatedAt ||
          existingForClient.clientRecordId !== nextClientRecordId
        ) {
          await ctx.db.patch(existingForClient._id, {
            nick,
            score: nextScore,
            streak: nextStreak,
            createdAt: nextCreatedAt,
            clientRecordId: nextClientRecordId,
          });
        }

        return existingForClient._id;
      }

      return ctx.db.insert("scores", {
        clientId: args.clientId,
        clientRecordId: args.clientRecordId,
        nick,
        score,
        streak,
        createdAt,
      });
    }

    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    assertNickAvailable(scores, nick);

    return ctx.db.insert("scores", {
      clientRecordId: args.clientRecordId,
      nick,
      score,
      streak,
      createdAt,
    });
  },
});

export const isNickAvailable = query({
  args: {
    nick: v.string(),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    return !hasNickConflict(scores, nick, args.clientId);
  },
});

export const listTopScores = query({
  args: {
    limit: v.optional(v.number()),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(
      1,
      Math.min(MAX_LIMIT, Math.floor(args.limit ?? DEFAULT_LIMIT)),
    );

    const scores = await ctx.db.query("scores").collect();
    const byNick = new Map<string, (typeof scores)[number]>();

    for (const entry of scores) {
      const key = nickKey(entry.nick);
      const current = byNick.get(key);

      if (!current || scoreSorter(entry, current) < 0) {
        byNick.set(key, entry);
      }
    }

    const sortedScores = [...byNick.values()].sort(scoreSorter);
    const currentClientIndex =
      typeof args.clientId === "string" && args.clientId.length > 0
        ? sortedScores.findIndex((score) => score.clientId === args.clientId)
        : -1;
    const currentClientScore =
      currentClientIndex >= 0 ? sortedScores[currentClientIndex] : null;

    const mappedTopScores = sortedScores.slice(0, limit).map((score) => ({
      id: score._id,
      nick: score.nick,
      score: score.score,
      streak: score.streak ?? 0,
      createdAt: score.createdAt,
      isCurrentClient:
        typeof args.clientId === "string" &&
        args.clientId.length > 0 &&
        score.clientId === args.clientId,
    }));

    return {
      scores: mappedTopScores,
      currentClientRank:
        currentClientIndex >= 0 ? currentClientIndex + 1 : null,
      currentClientEntry: currentClientScore
        ? {
            id: currentClientScore._id,
            nick: currentClientScore.nick,
            score: currentClientScore.score,
            streak: currentClientScore.streak ?? 0,
            createdAt: currentClientScore.createdAt,
            isCurrentClient: true,
          }
        : null,
    };
  },
});
