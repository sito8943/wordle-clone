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

export const addScore = mutation({
  args: {
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    score: v.number(),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const score = Math.max(0, Math.floor(args.score));
    const createdAt = args.createdAt ?? Date.now();
    const normalizedKey = nickKey(nick);

    if (args.clientRecordId) {
      const existing = await ctx.db
        .query("scores")
        .withIndex("by_client_record_id", (query) =>
          query.eq("clientRecordId", args.clientRecordId),
        )
        .first();

      if (existing) {
        const nextScore = Math.max(existing.score, score);
        const nextCreatedAt =
          nextScore > existing.score ? createdAt : existing.createdAt;

        if (
          existing.nick !== nick ||
          existing.score !== nextScore ||
          existing.createdAt !== nextCreatedAt
        ) {
          await ctx.db.patch(existing._id, {
            nick,
            score: nextScore,
            createdAt: nextCreatedAt,
          });
        }

        return existing._id;
      }
    }

    const scores = await ctx.db.query("scores").collect();
    const sameNick = scores.filter(
      (entry) => nickKey(entry.nick) === normalizedKey,
    );

    if (sameNick.length > 0) {
      const sorted = [...sameNick].sort(scoreSorter);
      const primary = sorted[0];

      const nextScore = Math.max(primary.score, score);
      const nextCreatedAt =
        nextScore > primary.score ? createdAt : primary.createdAt;

      if (
        primary.nick !== nick ||
        primary.score !== nextScore ||
        primary.createdAt !== nextCreatedAt ||
        (args.clientRecordId && primary.clientRecordId !== args.clientRecordId)
      ) {
        await ctx.db.patch(primary._id, {
          clientRecordId: args.clientRecordId ?? primary.clientRecordId,
          nick,
          score: nextScore,
          createdAt: nextCreatedAt,
        });
      }

      for (const duplicate of sorted.slice(1)) {
        await ctx.db.delete(duplicate._id);
      }

      return primary._id;
    }

    return ctx.db.insert("scores", {
      clientRecordId: args.clientRecordId,
      nick,
      score,
      createdAt,
    });
  },
});

export const listTopScores = query({
  args: {
    limit: v.optional(v.number()),
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

    return [...byNick.values()]
      .sort(scoreSorter)
      .slice(0, limit)
      .map((score) => ({
        id: score._id,
        nick: score.nick,
        score: score.score,
        createdAt: score.createdAt,
      }));
  },
});
