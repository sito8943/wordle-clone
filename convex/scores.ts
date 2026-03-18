import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const MAX_NICK_LENGTH = 30;
const PLAYER_CODE_LENGTH = 4;
const PLAYER_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const PLAYER_CODE_MAX_ATTEMPTS = 32;
const DEFAULT_DIFFICULTY = "normal";
const DEFAULT_KEYBOARD_PREFERENCE = "onscreen";
const NAME_UNAVAILABLE_ERROR = "Name is not available.";
const PLAYER_CODE_NOT_FOUND_ERROR = "Recovery code was not found.";
const PLAYER_CODE_GENERATION_ERROR =
  "Could not generate a unique recovery code.";

const normalizeNick = (value: string): string => {
  const trimmed = value.trim().slice(0, MAX_NICK_LENGTH);
  return trimmed || "Player";
};

const nickKey = (value: string): string => normalizeNick(value).toLowerCase();

const normalizeScore = (value: number): number =>
  Math.max(0, Math.floor(value));

const normalizeStreak = (value: number | undefined): number =>
  Math.max(0, Math.floor(value ?? 0));

const normalizeDifficulty = (value?: string): string =>
  value === "easy" ||
  value === "normal" ||
  value === "hard" ||
  value === "insane"
    ? value
    : DEFAULT_DIFFICULTY;

const normalizeKeyboardPreference = (value?: string): string =>
  value === "onscreen" || value === "native"
    ? value
    : DEFAULT_KEYBOARD_PREFERENCE;

const normalizeCode = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, PLAYER_CODE_LENGTH);

const isValidCode = (value?: string): value is string =>
  typeof value === "string" &&
  normalizeCode(value).length === PLAYER_CODE_LENGTH;

const createRandomCode = (): string => {
  let code = "";

  for (let index = 0; index < PLAYER_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * PLAYER_CODE_ALPHABET.length);
    code += PLAYER_CODE_ALPHABET[randomIndex];
  }

  return code;
};

const createClientRecordId = (): string =>
  `profile-${Date.now()}-${createRandomCode()}`;

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
  clientRecordId?: string;
  playerCode?: string;
  score: number;
  streak?: number;
  difficulty?: string;
  keyboardPreference?: string;
  createdAt: number;
};

type ScoreIndexRangeBuilder = {
  eq: (field: string, value: string) => ScoreIndexRangeBuilder;
};

type ScoreQueryBuilder = {
  collect: () => Promise<ScoreRecord[]>;
  first: () => Promise<ScoreRecord | null>;
  withIndex: (
    indexName: string,
    buildRange: (query: ScoreIndexRangeBuilder) => ScoreIndexRangeBuilder,
  ) => ScoreQueryBuilder;
};

type ScoresCtx = {
  db: {
    query: (tableName: string) => ScoreQueryBuilder;
    insert: (...args: unknown[]) => Promise<string>;
    patch: (...args: unknown[]) => Promise<void>;
  };
};

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

const buildPlayerProfile = (record: ScoreRecord) => ({
  id: record._id,
  clientId: record.clientId ?? null,
  clientRecordId: record.clientRecordId ?? record._id,
  nick: record.nick,
  playerCode: normalizeCode(record.playerCode ?? ""),
  score: normalizeScore(record.score),
  streak: normalizeStreak(record.streak),
  difficulty: normalizeDifficulty(record.difficulty),
  keyboardPreference: normalizeKeyboardPreference(record.keyboardPreference),
  createdAt: record.createdAt,
});

const resolveProfileRecord = async (
  ctx: ScoresCtx,
  clientRecordId?: string,
  clientId?: string,
) => {
  if (clientRecordId) {
    const byRecordId = (await ctx.db
      .query("scores")
      .withIndex("by_client_record_id", (query) =>
        query.eq("clientRecordId", clientRecordId),
      )
      .first()) as ScoreRecord | null;

    if (byRecordId) {
      return byRecordId;
    }
  }

  if (clientId) {
    return (await ctx.db
      .query("scores")
      .withIndex("by_client_id", (query) => query.eq("clientId", clientId))
      .first()) as ScoreRecord | null;
  }

  return null;
};

const ensureUniquePlayerCode = async (
  ctx: ScoresCtx,
): Promise<string> => {
  for (let attempt = 0; attempt < PLAYER_CODE_MAX_ATTEMPTS; attempt += 1) {
    const candidate = createRandomCode();
    const existing = await ctx.db
      .query("scores")
      .withIndex("by_player_code", (query) => query.eq("playerCode", candidate))
      .first();

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(PLAYER_CODE_GENERATION_ERROR);
};

const ensurePlayerCode = async (
  ctx: ScoresCtx,
  currentCode?: string,
): Promise<string> => {
  if (isValidCode(currentCode)) {
    return normalizeCode(currentCode);
  }

  return ensureUniquePlayerCode(ctx);
};

const upsertScoreRecord = async (
  ctx: ScoresCtx,
  args: {
    clientId?: string;
    clientRecordId?: string;
    nick: string;
    score: number;
    streak?: number;
    createdAt?: number;
  },
  overwriteExisting: boolean,
) => {
  const nick = normalizeNick(args.nick);
  const score = normalizeScore(args.score);
  const streak = normalizeStreak(args.streak);
  const createdAt = args.createdAt ?? Date.now();
  const existing = await resolveProfileRecord(
    ctx,
    args.clientRecordId,
    args.clientId,
  );
  const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];

  assertNickAvailable(
    scores,
    nick,
    args.clientId ?? existing?.clientId,
    existing?._id,
  );

  if (existing) {
    const nextScore = overwriteExisting
      ? score
      : Math.max(existing.score, score);
    const nextCreatedAt = overwriteExisting
      ? createdAt
      : nextScore > existing.score
        ? createdAt
        : existing.createdAt;
    const nextPatch = {
      clientId: args.clientId ?? existing.clientId,
      clientRecordId: args.clientRecordId ?? existing.clientRecordId,
      nick,
      score: nextScore,
      streak,
      createdAt: nextCreatedAt,
    };

    if (
      existing.clientId !== nextPatch.clientId ||
      existing.clientRecordId !== nextPatch.clientRecordId ||
      existing.nick !== nextPatch.nick ||
      existing.score !== nextPatch.score ||
      (existing.streak ?? 0) !== nextPatch.streak ||
      existing.createdAt !== nextPatch.createdAt
    ) {
      await ctx.db.patch(existing._id, nextPatch);
    }

    return existing._id;
  }

  return ctx.db.insert("scores", {
    clientId: args.clientId,
    clientRecordId: args.clientRecordId,
    nick,
    score,
    streak,
    difficulty: DEFAULT_DIFFICULTY,
    keyboardPreference: DEFAULT_KEYBOARD_PREFERENCE,
    createdAt,
  });
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
  handler: async (ctx, args) => upsertScoreRecord(ctx, args, false),
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
  handler: async (ctx, args) => upsertScoreRecord(ctx, args, true),
});

export const upsertPlayerProfile = mutation({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    score: v.optional(v.number()),
    streak: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const existing = await resolveProfileRecord(
      ctx,
      args.clientRecordId,
      args.clientId,
    );
    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];

    assertNickAvailable(
      scores,
      nick,
      args.clientId ?? existing?.clientId,
      existing?._id,
    );

    if (existing) {
      const patch = {
        clientId: args.clientId ?? existing.clientId,
        clientRecordId:
          args.clientRecordId ?? existing.clientRecordId ?? existing._id,
        nick,
        score:
          typeof args.score === "number"
            ? normalizeScore(args.score)
            : normalizeScore(existing.score),
        streak:
          typeof args.streak === "number"
            ? normalizeStreak(args.streak)
            : normalizeStreak(existing.streak),
        difficulty: normalizeDifficulty(
          args.difficulty ?? existing.difficulty,
        ),
        keyboardPreference: normalizeKeyboardPreference(
          args.keyboardPreference ?? existing.keyboardPreference,
        ),
        playerCode: await ensurePlayerCode(ctx, existing.playerCode),
      };

      if (
        existing.clientId !== patch.clientId ||
        existing.clientRecordId !== patch.clientRecordId ||
        existing.nick !== patch.nick ||
        existing.score !== patch.score ||
        (existing.streak ?? 0) !== patch.streak ||
        existing.difficulty !== patch.difficulty ||
        existing.keyboardPreference !== patch.keyboardPreference ||
        normalizeCode(existing.playerCode ?? "") !== patch.playerCode
      ) {
        await ctx.db.patch(existing._id, patch);
      }

      return buildPlayerProfile({
        ...existing,
        ...patch,
      });
    }

    const createdAt = Date.now();
    const clientRecordId = args.clientRecordId ?? createClientRecordId();
    const playerCode = await ensureUniquePlayerCode(ctx);
    const insertedId = await ctx.db.insert("scores", {
      clientId: args.clientId,
      clientRecordId,
      nick,
      playerCode,
      score: normalizeScore(args.score ?? 0),
      streak: normalizeStreak(args.streak),
      difficulty: normalizeDifficulty(args.difficulty),
      keyboardPreference: normalizeKeyboardPreference(args.keyboardPreference),
      createdAt,
    });

    return buildPlayerProfile({
      _id: insertedId,
      clientId: args.clientId,
      clientRecordId,
      nick,
      playerCode,
      score: normalizeScore(args.score ?? 0),
      streak: normalizeStreak(args.streak),
      difficulty: normalizeDifficulty(args.difficulty),
      keyboardPreference: normalizeKeyboardPreference(args.keyboardPreference),
      createdAt,
    });
  },
});

export const getPlayerByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    if (!isValidCode(code)) {
      throw new Error(PLAYER_CODE_NOT_FOUND_ERROR);
    }

    const existing = (await ctx.db
      .query("scores")
      .withIndex("by_player_code", (query) => query.eq("playerCode", code))
      .first()) as ScoreRecord | null;

    if (!existing) {
      throw new Error(PLAYER_CODE_NOT_FOUND_ERROR);
    }

    return buildPlayerProfile(existing);
  },
});

export const backfillPlayerCodes = mutation({
  args: {},
  handler: async (ctx) => {
    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const entry of scores) {
      processed += 1;

      if (isValidCode(entry.playerCode)) {
        skipped += 1;
        continue;
      }

      updated += 1;
      await ctx.db.patch(entry._id, {
        playerCode: await ensureUniquePlayerCode(ctx),
      });
    }

    return { processed, updated, skipped };
  },
});

export const isNickAvailable = query({
  args: {
    nick: v.string(),
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nick = normalizeNick(args.nick);
    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    const currentRecord = args.clientRecordId
      ? ((await ctx.db
          .query("scores")
          .withIndex("by_client_record_id", (query) =>
            query.eq("clientRecordId", args.clientRecordId),
          )
          .first()) as ScoreRecord | null)
      : null;

    return !hasNickConflict(
      scores,
      nick,
      args.clientId ?? currentRecord?.clientId,
      currentRecord?._id,
    );
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

    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    const byNick = new Map<string, ScoreRecord>();

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
      streak: normalizeStreak(score.streak),
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
            streak: normalizeStreak(currentClientScore.streak),
            createdAt: currentClientScore.createdAt,
            isCurrentClient: true,
          }
        : null,
    };
  },
});
