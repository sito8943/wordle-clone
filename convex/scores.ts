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

const NICK_SUFFIX_PATTERN = /\s+#\d+$/i;

type ScoreRecord = {
  _id: string;
  nick: string;
  clientId?: string;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeNickBase = (value: string): string => {
  const normalized = normalizeNick(value);
  const base = normalized.replace(NICK_SUFFIX_PATTERN, "").trim();
  return base.length > 0 ? base : "Player";
};

const toNickWithIndex = (baseNick: string, index: number): string => {
  if (index <= 1) {
    return baseNick;
  }

  const suffix = ` #${index}`;
  const maxBaseLength = Math.max(1, MAX_NICK_LENGTH - suffix.length);
  return `${baseNick.slice(0, maxBaseLength)}${suffix}`;
};

const matchNickIndex = (value: string, baseNick: string): number | null => {
  const pattern = new RegExp(`^${escapeRegExp(baseNick)}(?:\\s#(\\d+))?$`, "i");
  const match = value.match(pattern);
  if (!match) {
    return null;
  }

  if (!match[1]) {
    return 1;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : null;
};

const resolveUniqueNickForClient = (
  scores: ScoreRecord[],
  requestedNick: string,
  clientId: string,
): string => {
  const baseNick = normalizeNickBase(requestedNick);
  const usedIndices = new Set<number>();

  for (const entry of scores) {
    const index = matchNickIndex(entry.nick, baseNick);
    if (!index) {
      continue;
    }

    if (entry.clientId === clientId) {
      return entry.nick;
    }

    usedIndices.add(index);
  }

  if (!usedIndices.has(1)) {
    return baseNick;
  }

  let nextIndex = 2;
  while (usedIndices.has(nextIndex)) {
    nextIndex += 1;
  }

  return toNickWithIndex(baseNick, nextIndex);
};

export const addScore = mutation({
  args: {
    clientId: v.optional(v.string()),
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
        const nextClientId = args.clientId ?? existing.clientId;

        if (
          existing.nick !== nick ||
          existing.score !== nextScore ||
          existing.createdAt !== nextCreatedAt ||
          existing.clientId !== nextClientId
        ) {
          await ctx.db.patch(existing._id, {
            clientId: nextClientId,
            nick,
            score: nextScore,
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
      const scores = await ctx.db.query("scores").collect();
      const resolvedNick = resolveUniqueNickForClient(
        scores as ScoreRecord[],
        nick,
        args.clientId,
      );

      if (existingForClient) {
        const nextScore = Math.max(existingForClient.score, score);
        const nextCreatedAt =
          nextScore > existingForClient.score
            ? createdAt
            : existingForClient.createdAt;
        const nextClientRecordId =
          args.clientRecordId ?? existingForClient.clientRecordId;

        if (
          existingForClient.nick !== resolvedNick ||
          existingForClient.score !== nextScore ||
          existingForClient.createdAt !== nextCreatedAt ||
          existingForClient.clientRecordId !== nextClientRecordId
        ) {
          await ctx.db.patch(existingForClient._id, {
            nick: resolvedNick,
            score: nextScore,
            createdAt: nextCreatedAt,
            clientRecordId: nextClientRecordId,
          });
        }

        return existingForClient._id;
      }

      return ctx.db.insert("scores", {
        clientId: args.clientId,
        clientRecordId: args.clientRecordId,
        nick: resolvedNick,
        score,
        createdAt,
      });
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
            createdAt: currentClientScore.createdAt,
            isCurrentClient: true,
          }
        : null,
    };
  },
});
