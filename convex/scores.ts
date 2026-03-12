import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const MAX_NICK_LENGTH = 30;

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
    nick: v.string(),
    score: v.number(),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const nick = args.nick.trim().slice(0, MAX_NICK_LENGTH) || "Player";
    const score = Math.max(0, Math.floor(args.score));
    const createdAt = args.createdAt ?? Date.now();

    return ctx.db.insert("scores", {
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

    return scores
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
