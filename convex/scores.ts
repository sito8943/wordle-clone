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

type SupportedLanguage = "en" | "es";

const normalizeLanguage = (value?: string): SupportedLanguage =>
  value === "es" ? "es" : "en";

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
  language?: string;
  score: number;
  streak?: number;
  scoreByLanguage?: Partial<Record<SupportedLanguage, number>>;
  streakByLanguage?: Partial<Record<SupportedLanguage, number>>;
  createdAtByLanguage?: Partial<Record<SupportedLanguage, number>>;
  difficulty?: string;
  keyboardPreference?: string;
  createdAt: number;
};

type ScoreEventRecord = {
  _id: string;
  profileId: string;
  eventId: string;
  kind: string;
  pointsDelta?: number;
  happenedAt: number;
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

type LanguageStats = {
  score: number;
  streak: number;
  createdAt: number;
};

const getLanguageStats = (
  record: ScoreRecord,
  language: SupportedLanguage,
): LanguageStats => {
  const legacyLanguage = normalizeLanguage(record.language);
  const score =
    typeof record.scoreByLanguage?.[language] === "number"
      ? normalizeScore(record.scoreByLanguage[language] as number)
      : language === legacyLanguage
        ? normalizeScore(record.score)
        : 0;
  const streak =
    typeof record.streakByLanguage?.[language] === "number"
      ? normalizeStreak(record.streakByLanguage[language] as number)
      : language === legacyLanguage
        ? normalizeStreak(record.streak)
        : 0;
  const createdAt =
    typeof record.createdAtByLanguage?.[language] === "number"
      ? Math.floor(record.createdAtByLanguage[language] as number)
      : language === legacyLanguage
        ? record.createdAt
        : record.createdAt;

  return { score, streak, createdAt };
};

const withLanguageStats = (
  record: ScoreRecord,
  language: SupportedLanguage,
  stats: LanguageStats,
) => {
  const legacyLanguage = normalizeLanguage(record.language);
  const nextScoreByLanguage: Partial<Record<SupportedLanguage, number>> = {
    ...(record.scoreByLanguage ?? {}),
  };
  const nextStreakByLanguage: Partial<Record<SupportedLanguage, number>> = {
    ...(record.streakByLanguage ?? {}),
  };
  const nextCreatedAtByLanguage: Partial<Record<SupportedLanguage, number>> = {
    ...(record.createdAtByLanguage ?? {}),
  };

  if (nextScoreByLanguage[legacyLanguage] === undefined) {
    nextScoreByLanguage[legacyLanguage] = normalizeScore(record.score);
  }

  if (nextStreakByLanguage[legacyLanguage] === undefined) {
    nextStreakByLanguage[legacyLanguage] = normalizeStreak(record.streak);
  }

  if (nextCreatedAtByLanguage[legacyLanguage] === undefined) {
    nextCreatedAtByLanguage[legacyLanguage] = Math.floor(record.createdAt);
  }

  nextScoreByLanguage[language] = normalizeScore(stats.score);
  nextStreakByLanguage[language] = normalizeStreak(stats.streak);
  nextCreatedAtByLanguage[language] = Math.floor(stats.createdAt);

  return {
    language,
    score: normalizeScore(stats.score),
    streak: normalizeStreak(stats.streak),
    createdAt: Math.floor(stats.createdAt),
    scoreByLanguage: nextScoreByLanguage,
    streakByLanguage: nextStreakByLanguage,
    createdAtByLanguage: nextCreatedAtByLanguage,
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

const buildPlayerProfile = (
  record: ScoreRecord,
  language: SupportedLanguage = normalizeLanguage(record.language),
) => {
  const stats = getLanguageStats(record, language);

  return {
    id: record._id,
    clientId: record.clientId ?? null,
    clientRecordId: record.clientRecordId ?? record._id,
    nick: record.nick,
    playerCode: normalizeCode(record.playerCode ?? ""),
    language,
    score: stats.score,
    streak: stats.streak,
    difficulty: normalizeDifficulty(record.difficulty),
    keyboardPreference: normalizeKeyboardPreference(record.keyboardPreference),
    createdAt: stats.createdAt,
  };
};

const roundSyncEventValidator = v.union(
  v.object({
    id: v.string(),
    kind: v.literal("win"),
    pointsDelta: v.number(),
    happenedAt: v.number(),
    version: v.number(),
  }),
  v.object({
    id: v.string(),
    kind: v.literal("loss"),
    happenedAt: v.number(),
    version: v.number(),
  }),
);

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

const ensureUniquePlayerCode = async (ctx: ScoresCtx): Promise<string> => {
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

const upsertProfileRecord = async (
  ctx: ScoresCtx,
  args: {
    clientId?: string;
    clientRecordId?: string;
    nick: string;
    language?: string;
    difficulty?: string;
    keyboardPreference?: string;
  },
) => {
  const nick = normalizeNick(args.nick);
  const language = normalizeLanguage(args.language);
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
    const languageStats = getLanguageStats(existing, language);
    const patch = {
      clientId: args.clientId ?? existing.clientId,
      clientRecordId:
        args.clientRecordId ?? existing.clientRecordId ?? existing._id,
      nick,
      ...withLanguageStats(existing, language, languageStats),
      difficulty: normalizeDifficulty(args.difficulty ?? existing.difficulty),
      keyboardPreference: normalizeKeyboardPreference(
        args.keyboardPreference ?? existing.keyboardPreference,
      ),
      playerCode: await ensurePlayerCode(ctx, existing.playerCode),
    };

    if (
      existing.clientId !== patch.clientId ||
      existing.clientRecordId !== patch.clientRecordId ||
      existing.nick !== patch.nick ||
      normalizeLanguage(existing.language) !== patch.language ||
      existing.score !== patch.score ||
      normalizeStreak(existing.streak) !== patch.streak ||
      existing.createdAt !== patch.createdAt ||
      existing.difficulty !== patch.difficulty ||
      existing.keyboardPreference !== patch.keyboardPreference ||
      normalizeCode(existing.playerCode ?? "") !== patch.playerCode
    ) {
      await ctx.db.patch(existing._id, patch);
    }

    return {
      ...existing,
      ...patch,
    };
  }

  const createdAt = Date.now();
  const clientRecordId = args.clientRecordId ?? createClientRecordId();
  const playerCode = await ensureUniquePlayerCode(ctx);
  const baseLanguageStats = withLanguageStats(
    {
      ...({
        _id: "",
        nick,
        score: 0,
        streak: 0,
        createdAt,
      } as ScoreRecord),
      scoreByLanguage: {},
      streakByLanguage: {},
      createdAtByLanguage: {},
    },
    language,
    { score: 0, streak: 0, createdAt },
  );
  const insertedId = await ctx.db.insert("scores", {
    clientId: args.clientId,
    clientRecordId,
    nick,
    playerCode,
    ...baseLanguageStats,
    difficulty: normalizeDifficulty(args.difficulty),
    keyboardPreference: normalizeKeyboardPreference(args.keyboardPreference),
  });

  return {
    _id: insertedId,
    clientId: args.clientId,
    clientRecordId,
    nick,
    playerCode,
    ...baseLanguageStats,
    difficulty: normalizeDifficulty(args.difficulty),
    keyboardPreference: normalizeKeyboardPreference(args.keyboardPreference),
  };
};

const upsertScoreRecord = async (
  ctx: ScoresCtx,
  args: {
    clientId?: string;
    clientRecordId?: string;
    nick: string;
    language?: string;
    score: number;
    streak?: number;
    createdAt?: number;
  },
  overwriteExisting: boolean,
) => {
  const nick = normalizeNick(args.nick);
  const language = normalizeLanguage(args.language);
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
    const existingLanguageStats = getLanguageStats(existing, language);
    const nextScore = overwriteExisting
      ? score
      : Math.max(existingLanguageStats.score, score);
    const nextCreatedAt = overwriteExisting
      ? createdAt
      : nextScore > existingLanguageStats.score
        ? createdAt
        : existingLanguageStats.createdAt;
    const nextPatch = {
      clientId: args.clientId ?? existing.clientId,
      clientRecordId: args.clientRecordId ?? existing.clientRecordId,
      nick,
      ...withLanguageStats(existing, language, {
        score: nextScore,
        streak,
        createdAt: nextCreatedAt,
      }),
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
    ...withLanguageStats(
      {
        _id: "",
        nick,
        score: 0,
        streak: 0,
        createdAt,
      },
      language,
      { score, streak, createdAt },
    ),
    difficulty: DEFAULT_DIFFICULTY,
    keyboardPreference: DEFAULT_KEYBOARD_PREFERENCE,
  });
};

export const addScore = mutation({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    language: v.optional(v.string()),
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
    language: v.optional(v.string()),
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
    language: v.optional(v.string()),
    score: v.optional(v.number()),
    streak: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    buildPlayerProfile(
      await upsertProfileRecord(ctx, {
        clientId: args.clientId,
        clientRecordId: args.clientRecordId,
        nick: args.nick,
        language: args.language,
        difficulty: args.difficulty,
        keyboardPreference: args.keyboardPreference,
      }),
      normalizeLanguage(args.language),
    ),
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

export const getCurrentPlayerProfile = query({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await resolveProfileRecord(
      ctx,
      args.clientRecordId,
      args.clientId,
    );

    return existing
      ? buildPlayerProfile(existing, normalizeLanguage(args.language))
      : null;
  },
});

export const syncRoundEvents = mutation({
  args: {
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
    nick: v.string(),
    language: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    keyboardPreference: v.optional(v.string()),
    events: v.array(roundSyncEventValidator),
  },
  handler: async (ctx, args) => {
    const language = normalizeLanguage(args.language);
    const orderedEvents = [...args.events]
      .filter((event) => event.version === 2)
      .sort((left, right) => left.happenedAt - right.happenedAt);

    const profile = await upsertProfileRecord(ctx, {
      clientId: args.clientId,
      clientRecordId: args.clientRecordId,
      nick: args.nick,
      language,
      difficulty: args.difficulty,
      keyboardPreference: args.keyboardPreference,
    });

    const profileLanguageStats = getLanguageStats(profile, language);
    let nextScore = normalizeScore(profileLanguageStats.score);
    let nextStreak = normalizeStreak(profileLanguageStats.streak);
    let nextCreatedAt = profileLanguageStats.createdAt;
    let hasChanges = false;

    for (const event of orderedEvents) {
      const existingEvent = (await ctx.db
        .query("scoreEvents")
        .withIndex("by_event_id", (query) => query.eq("eventId", event.id))
        .first()) as ScoreEventRecord | null;

      if (existingEvent) {
        continue;
      }

      if (event.kind === "win") {
        nextScore = normalizeScore(
          nextScore + normalizeScore(event.pointsDelta),
        );
        nextStreak += 1;
      } else {
        nextStreak = 0;
      }

      nextCreatedAt = Math.max(nextCreatedAt, event.happenedAt);
      hasChanges = true;

      await ctx.db.insert("scoreEvents", {
        profileId: profile._id,
        eventId: event.id,
        kind: event.kind,
        pointsDelta:
          event.kind === "win" ? normalizeScore(event.pointsDelta) : undefined,
        happenedAt: event.happenedAt,
        createdAt: Date.now(),
      });
    }

    if (hasChanges) {
      const nextStats = withLanguageStats(profile, language, {
        score: nextScore,
        streak: nextStreak,
        createdAt: nextCreatedAt,
      });
      await ctx.db.patch(profile._id, {
        ...nextStats,
      });
    }

    return buildPlayerProfile(
      {
        ...profile,
        ...withLanguageStats(profile, language, {
          score: nextScore,
          streak: nextStreak,
          createdAt: nextCreatedAt,
        }),
      },
      language,
    );
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
    language: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = normalizeLanguage(args.language);
    const limit = Math.max(
      1,
      Math.min(MAX_LIMIT, Math.floor(args.limit ?? DEFAULT_LIMIT)),
    );

    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    const byNick = new Map<string, ScoreRecord>();

    for (const entry of scores) {
      const key = nickKey(entry.nick);
      const current = byNick.get(key);
      const entryStats = getLanguageStats(entry, language);
      const currentStats = current ? getLanguageStats(current, language) : null;

      if (
        !current ||
        scoreSorter(
          { score: entryStats.score, createdAt: entryStats.createdAt },
          {
            score: currentStats?.score ?? 0,
            createdAt: currentStats?.createdAt ?? current.createdAt,
          },
        ) < 0
      ) {
        byNick.set(key, entry);
      }
    }

    const sortedScores = [...byNick.values()].sort((left, right) => {
      const leftStats = getLanguageStats(left, language);
      const rightStats = getLanguageStats(right, language);
      return scoreSorter(
        { score: leftStats.score, createdAt: leftStats.createdAt },
        { score: rightStats.score, createdAt: rightStats.createdAt },
      );
    });
    const currentProfile = await resolveProfileRecord(
      ctx,
      args.clientRecordId,
      args.clientId,
    );
    const currentClientIndex = currentProfile
      ? sortedScores.findIndex(
          (score) =>
            score._id === currentProfile._id ||
            score.clientRecordId === currentProfile.clientRecordId,
        )
      : -1;
    const currentClientScore =
      currentClientIndex >= 0 ? sortedScores[currentClientIndex] : null;

    const mappedTopScores = sortedScores.slice(0, limit).map((score) => {
      const stats = getLanguageStats(score, language);
      return {
        id: score._id,
        nick: score.nick,
        language,
        score: stats.score,
        streak: normalizeStreak(stats.streak),
        createdAt: stats.createdAt,
        isCurrentClient:
          currentProfile !== null &&
          (score._id === currentProfile._id ||
            score.clientRecordId === currentProfile.clientRecordId),
      };
    });

    return {
      scores: mappedTopScores,
      currentClientRank:
        currentClientIndex >= 0 ? currentClientIndex + 1 : null,
      currentClientEntry: currentClientScore
        ? (() => {
            const stats = getLanguageStats(currentClientScore, language);
            return {
              id: currentClientScore._id,
              nick: currentClientScore.nick,
              language,
              score: stats.score,
              streak: normalizeStreak(stats.streak),
              createdAt: stats.createdAt,
              isCurrentClient: true,
            };
          })()
        : null,
    };
  },
});
