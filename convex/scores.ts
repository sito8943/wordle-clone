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
const MAX_GUESSES = 6;
const MAX_STREAK_FOR_SCORE_MULTIPLIER = 100;
const STREAK_MODIFIER = 0.3;
const HARD_MODE_SECONDS_BONUS = 4;
const MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS = 5000;
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
type SupportedMode = "classic" | "lightning" | "daily";
type SupportedWordleMode = SupportedMode | "zen";
type SupportedDifficulty = "easy" | "normal" | "hard" | "insane";
const TUTORIAL_MODE_IDS: SupportedWordleMode[] = [
  "classic",
  "lightning",
  "zen",
  "daily",
];

const DIFFICULTY_SCORE_MULTIPLIERS: Record<SupportedDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 5,
  insane: 7,
};

const normalizeLanguage = (value?: string): SupportedLanguage =>
  value === "es" ? "es" : "en";

const normalizeModeId = (value?: string): SupportedMode =>
  value === "lightning" || value === "daily" ? value : "classic";

const normalizeDifficulty = (value?: string): SupportedDifficulty =>
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

const normalizeTutorialPromptSeenModes = (
  value: unknown,
  existing?: Partial<Record<SupportedWordleMode, boolean>>,
): Partial<Record<SupportedWordleMode, boolean>> | undefined => {
  const normalized: Partial<Record<SupportedWordleMode, boolean>> = {
    ...(existing ?? {}),
  };

  if (value && typeof value === "object") {
    const candidate = value as Partial<Record<SupportedWordleMode, unknown>>;

    for (const modeId of TUTORIAL_MODE_IDS) {
      if (candidate[modeId] === true) {
        normalized[modeId] = true;
      }
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const areTutorialPromptSeenModesEqual = (
  left: Partial<Record<SupportedWordleMode, boolean>> | undefined,
  right: Partial<Record<SupportedWordleMode, boolean>> | undefined,
): boolean =>
  TUTORIAL_MODE_IDS.every(
    (modeId) => (left?.[modeId] === true) === (right?.[modeId] === true),
  );

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
  scoreByLanguageAndMode?: Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;
  streakByLanguageAndMode?: Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;
  createdAtByLanguageAndMode?: Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;
  difficulty?: string;
  keyboardPreference?: string;
  tutorialPromptSeenModes?: Partial<Record<SupportedWordleMode, boolean>>;
  createdAt: number;
};

type ScoreEventRecord = {
  _id: string;
  profileId: string;
  eventId: string;
  kind: string;
  version?: number;
  clientPointsDelta?: number;
  pointsDelta?: number;
  rejectionReason?: string;
  modeId?: string;
  happenedAt: number;
  createdAt: number;
};

type RoundSyncWinProof = {
  roundStartedAt: number;
  guessesUsed: number;
  difficulty: SupportedDifficulty;
  hardModeEnabled: boolean;
  hardModeSecondsLeft: number;
  guessWords: string[];
};

type RoundSyncWinEventV2 = {
  id: string;
  kind: "win";
  pointsDelta: number;
  modeId?: string;
  happenedAt: number;
  version: 2;
};

type RoundSyncWinEventV3 = {
  id: string;
  kind: "win";
  pointsDelta?: number;
  modeId?: string;
  happenedAt: number;
  version: 3;
  proof: RoundSyncWinProof;
};

type RoundSyncLossEvent = {
  id: string;
  kind: "loss";
  modeId?: string;
  happenedAt: number;
  version: number;
};

type RoundSyncEvent =
  | RoundSyncWinEventV2
  | RoundSyncWinEventV3
  | RoundSyncLossEvent;

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

const getModeStats = (
  record: ScoreRecord,
  language: SupportedLanguage,
  modeId: SupportedMode,
): LanguageStats => {
  const languageStats = getLanguageStats(record, language);
  const scoreByMode = record.scoreByLanguageAndMode?.[language];
  const streakByMode = record.streakByLanguageAndMode?.[language];
  const createdAtByMode = record.createdAtByLanguageAndMode?.[language];

  return {
    score:
      typeof scoreByMode?.[modeId] === "number"
        ? normalizeScore(scoreByMode[modeId] as number)
        : modeId === "classic"
          ? languageStats.score
          : 0,
    streak:
      typeof streakByMode?.[modeId] === "number"
        ? normalizeStreak(streakByMode[modeId] as number)
        : modeId === "classic"
          ? languageStats.streak
          : 0,
    createdAt:
      typeof createdAtByMode?.[modeId] === "number"
        ? Math.floor(createdAtByMode[modeId] as number)
        : modeId === "classic"
          ? languageStats.createdAt
          : 0,
  };
};

const hasModeStats = (
  record: ScoreRecord,
  language: SupportedLanguage,
  modeId: SupportedMode,
): boolean => {
  if (modeId === "classic") {
    return true;
  }

  return (
    typeof record.scoreByLanguageAndMode?.[language]?.[modeId] === "number" ||
    typeof record.streakByLanguageAndMode?.[language]?.[modeId] === "number" ||
    typeof record.createdAtByLanguageAndMode?.[language]?.[modeId] === "number"
  );
};

const withModeStats = (
  record: ScoreRecord,
  language: SupportedLanguage,
  modeId: SupportedMode,
  stats: LanguageStats,
) => {
  const nextScoreByLanguageAndMode = {
    ...(record.scoreByLanguageAndMode ?? {}),
  } as Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;
  const nextStreakByLanguageAndMode = {
    ...(record.streakByLanguageAndMode ?? {}),
  } as Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;
  const nextCreatedAtByLanguageAndMode = {
    ...(record.createdAtByLanguageAndMode ?? {}),
  } as Partial<
    Record<SupportedLanguage, Partial<Record<SupportedMode, number>>>
  >;

  const currentLanguageScores = {
    ...(nextScoreByLanguageAndMode[language] ?? {}),
  };
  const currentLanguageStreaks = {
    ...(nextStreakByLanguageAndMode[language] ?? {}),
  };
  const currentLanguageCreatedAt = {
    ...(nextCreatedAtByLanguageAndMode[language] ?? {}),
  };
  const languageStats = getLanguageStats(record, language);

  if (currentLanguageScores.classic === undefined) {
    currentLanguageScores.classic = languageStats.score;
  }
  if (currentLanguageStreaks.classic === undefined) {
    currentLanguageStreaks.classic = languageStats.streak;
  }
  if (currentLanguageCreatedAt.classic === undefined) {
    currentLanguageCreatedAt.classic = languageStats.createdAt;
  }

  currentLanguageScores[modeId] = normalizeScore(stats.score);
  currentLanguageStreaks[modeId] = normalizeStreak(stats.streak);
  currentLanguageCreatedAt[modeId] = Math.floor(stats.createdAt);

  nextScoreByLanguageAndMode[language] = currentLanguageScores;
  nextStreakByLanguageAndMode[language] = currentLanguageStreaks;
  nextCreatedAtByLanguageAndMode[language] = currentLanguageCreatedAt;

  return {
    scoreByLanguageAndMode: nextScoreByLanguageAndMode,
    streakByLanguageAndMode: nextStreakByLanguageAndMode,
    createdAtByLanguageAndMode: nextCreatedAtByLanguageAndMode,
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
  options?: { hasWonDailyToday?: boolean },
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
    hasWonDailyToday: options?.hasWonDailyToday === true,
    difficulty: normalizeDifficulty(record.difficulty),
    keyboardPreference: normalizeKeyboardPreference(record.keyboardPreference),
    tutorialPromptSeenModes: normalizeTutorialPromptSeenModes(
      record.tutorialPromptSeenModes,
    ),
    createdAt: stats.createdAt,
  };
};

const getCurrentUTCDayRange = (): { startAt: number; endAt: number } => {
  const now = new Date();
  const startAt = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return {
    startAt,
    endAt: startAt + 24 * 60 * 60 * 1000,
  };
};

const hasWonDailyTodayFromEvents = (
  events: ScoreEventRecord[],
  range: { startAt: number; endAt: number },
): boolean =>
  events.some(
    (event) =>
      isDailyWinWithAppliedPoints(event) &&
      event.happenedAt >= range.startAt &&
      event.happenedAt < range.endAt,
  );

const isDailyWinWithAppliedPoints = (event: ScoreEventRecord): boolean =>
  event.kind === "win" &&
  normalizeModeId(event.modeId) === "daily" &&
  !event.rejectionReason &&
  normalizeScore(event.pointsDelta ?? 0) > 0;

const getUTCDayRangeForTimestamp = (
  timestamp: number,
): { startAt: number; endAt: number } => {
  const date = new Date(timestamp);
  const startAt = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return {
    startAt,
    endAt: startAt + 24 * 60 * 60 * 1000,
  };
};

const toUTCDayKey = (timestamp: number): string => {
  const range = getUTCDayRangeForTimestamp(timestamp);
  return new Date(range.startAt).toISOString().slice(0, 10);
};

const isValidTimestamp = (value: number): boolean =>
  Number.isFinite(value) && value > 0;

const isValidGuessesUsed = (value: number): boolean =>
  Number.isInteger(value) && value >= 1 && value <= MAX_GUESSES;

const toSafeHardModeTimeBonus = (
  hardModeEnabled: boolean,
  hardModeSecondsLeft: number,
): number => {
  if (!hardModeEnabled || !Number.isFinite(hardModeSecondsLeft)) {
    return 0;
  }

  if (hardModeSecondsLeft <= 1) {
    return 0;
  }

  return Math.max(0, Math.floor(hardModeSecondsLeft / HARD_MODE_SECONDS_BONUS));
};

const toStreakMultiplier = (streak: number): number => {
  const safeStreak = Math.min(
    MAX_STREAK_FOR_SCORE_MULTIPLIER,
    Math.max(0, Math.floor(streak)),
  );

  return 1 + STREAK_MODIFIER * Math.sqrt(safeStreak);
};

type V3WinValidationResult =
  | {
      ok: true;
      authoritativePointsDelta: number;
    }
  | {
      ok: false;
      rejectionReason: string;
    };

const getAuthoritativeV3WinResult = (
  event: RoundSyncWinEventV3,
  modeId: SupportedMode,
  modeStreakBeforeWin: number,
): V3WinValidationResult => {
  const roundStartedAt = event.proof.roundStartedAt;

  if (!isValidGuessesUsed(event.proof.guessesUsed)) {
    return { ok: false, rejectionReason: "invalid-guesses-used" };
  }

  if (
    !isValidTimestamp(roundStartedAt) ||
    !isValidTimestamp(event.happenedAt)
  ) {
    return { ok: false, rejectionReason: "invalid-event-timestamps" };
  }

  if (roundStartedAt > event.happenedAt) {
    return { ok: false, rejectionReason: "round-start-after-event" };
  }

  if (
    event.happenedAt - roundStartedAt <
    MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS
  ) {
    return { ok: false, rejectionReason: "round-duration-too-short" };
  }

  if (modeId === "daily") {
    return { ok: true, authoritativePointsDelta: 1 };
  }

  const basePoints = Math.max(0, MAX_GUESSES - event.proof.guessesUsed + 1);
  const difficultyMultiplier =
    DIFFICULTY_SCORE_MULTIPLIERS[event.proof.difficulty];
  const timeBonus = toSafeHardModeTimeBonus(
    event.proof.hardModeEnabled,
    event.proof.hardModeSecondsLeft,
  );
  // Asuncion: streakActualDelModo es la racha del modo antes de aplicar este win.
  const streakMultiplier = toStreakMultiplier(modeStreakBeforeWin);

  return {
    ok: true,
    authoritativePointsDelta: normalizeScore(
      Math.round(
        (basePoints * difficultyMultiplier + timeBonus) * streakMultiplier,
      ),
    ),
  };
};

const getDailyWinnersTodayByProfileId = async (
  ctx: ScoresCtx,
  profileIds: string[],
): Promise<Map<string, boolean>> => {
  const dailyWinsByProfileId = new Map<string, boolean>();
  const range = getCurrentUTCDayRange();
  const uniqueProfileIds = [...new Set(profileIds.filter(Boolean))];

  await Promise.all(
    uniqueProfileIds.map(async (profileId) => {
      const profileEvents = (await ctx.db
        .query("scoreEvents")
        .withIndex("by_profile_id", (query) => query.eq("profileId", profileId))
        .collect()) as ScoreEventRecord[];
      dailyWinsByProfileId.set(
        profileId,
        hasWonDailyTodayFromEvents(profileEvents, range),
      );
    }),
  );

  return dailyWinsByProfileId;
};

const hasProfileWonDailyToday = async (
  ctx: ScoresCtx,
  profileId: string,
): Promise<boolean> => {
  const profileEvents = (await ctx.db
    .query("scoreEvents")
    .withIndex("by_profile_id", (query) => query.eq("profileId", profileId))
    .collect()) as ScoreEventRecord[];

  return hasWonDailyTodayFromEvents(profileEvents, getCurrentUTCDayRange());
};

const roundSyncEventValidator = v.union(
  v.object({
    id: v.string(),
    kind: v.literal("win"),
    pointsDelta: v.number(),
    modeId: v.optional(v.string()),
    happenedAt: v.number(),
    version: v.literal(2),
  }),
  v.object({
    id: v.string(),
    kind: v.literal("win"),
    pointsDelta: v.optional(v.number()),
    modeId: v.optional(v.string()),
    happenedAt: v.number(),
    version: v.literal(3),
    proof: v.object({
      roundStartedAt: v.number(),
      guessesUsed: v.number(),
      difficulty: v.union(
        v.literal("easy"),
        v.literal("normal"),
        v.literal("hard"),
        v.literal("insane"),
      ),
      hardModeEnabled: v.boolean(),
      hardModeSecondsLeft: v.number(),
      guessWords: v.array(v.string()),
    }),
  }),
  v.object({
    id: v.string(),
    kind: v.literal("loss"),
    modeId: v.optional(v.string()),
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
    tutorialPromptSeenModes?: Partial<Record<SupportedWordleMode, boolean>>;
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
    const tutorialPromptSeenModes = normalizeTutorialPromptSeenModes(
      args.tutorialPromptSeenModes,
      existing.tutorialPromptSeenModes,
    );
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
      tutorialPromptSeenModes,
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
      !areTutorialPromptSeenModesEqual(
        existing.tutorialPromptSeenModes,
        patch.tutorialPromptSeenModes,
      ) ||
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
  const tutorialPromptSeenModes = normalizeTutorialPromptSeenModes(
    args.tutorialPromptSeenModes,
  );
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
    tutorialPromptSeenModes,
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
    tutorialPromptSeenModes,
  };
};

const upsertScoreRecord = async (
  ctx: ScoresCtx,
  args: {
    clientId?: string;
    clientRecordId?: string;
    nick: string;
    language?: string;
    modeId?: string;
    score: number;
    streak?: number;
    createdAt?: number;
  },
  overwriteExisting: boolean,
) => {
  const nick = normalizeNick(args.nick);
  const language = normalizeLanguage(args.language);
  const modeId = normalizeModeId(args.modeId);
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
    const existingModeStats = getModeStats(existing, language, modeId);
    const nextLanguageScore = overwriteExisting
      ? score
      : Math.max(existingLanguageStats.score, score);
    const nextLanguageCreatedAt = overwriteExisting
      ? createdAt
      : nextLanguageScore > existingLanguageStats.score
        ? createdAt
        : existingLanguageStats.createdAt;
    const nextModeScore = overwriteExisting
      ? score
      : Math.max(existingModeStats.score, score);
    const nextModeCreatedAt = overwriteExisting
      ? createdAt
      : nextModeScore > existingModeStats.score
        ? createdAt
        : existingModeStats.createdAt;
    const nextPatch = {
      clientId: args.clientId ?? existing.clientId,
      clientRecordId: args.clientRecordId ?? existing.clientRecordId,
      nick,
      ...withLanguageStats(existing, language, {
        score: nextLanguageScore,
        streak,
        createdAt: nextLanguageCreatedAt,
      }),
      ...withModeStats(existing, language, modeId, {
        score: nextModeScore,
        streak,
        createdAt: nextModeCreatedAt,
      }),
    };

    if (
      existing.clientId !== nextPatch.clientId ||
      existing.clientRecordId !== nextPatch.clientRecordId ||
      existing.nick !== nextPatch.nick ||
      existing.score !== nextPatch.score ||
      (existing.streak ?? 0) !== nextPatch.streak ||
      existing.createdAt !== nextPatch.createdAt ||
      existing.scoreByLanguageAndMode?.[language]?.[modeId] !==
        nextPatch.scoreByLanguageAndMode?.[language]?.[modeId] ||
      existing.streakByLanguageAndMode?.[language]?.[modeId] !==
        nextPatch.streakByLanguageAndMode?.[language]?.[modeId] ||
      existing.createdAtByLanguageAndMode?.[language]?.[modeId] !==
        nextPatch.createdAtByLanguageAndMode?.[language]?.[modeId]
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
    ...withModeStats(
      {
        _id: "",
        nick,
        score: 0,
        streak: 0,
        createdAt,
      },
      language,
      modeId,
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
    modeId: v.optional(v.string()),
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
    modeId: v.optional(v.string()),
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
    tutorialPromptSeenModes: v.optional(
      v.object({
        classic: v.optional(v.boolean()),
        lightning: v.optional(v.boolean()),
        zen: v.optional(v.boolean()),
        daily: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const profileRecord = await upsertProfileRecord(ctx, {
      clientId: args.clientId,
      clientRecordId: args.clientRecordId,
      nick: args.nick,
      language: args.language,
      difficulty: args.difficulty,
      keyboardPreference: args.keyboardPreference,
      tutorialPromptSeenModes: args.tutorialPromptSeenModes,
    });
    const hasWonDailyToday = await hasProfileWonDailyToday(
      ctx,
      profileRecord._id,
    );

    return buildPlayerProfile(profileRecord, normalizeLanguage(args.language), {
      hasWonDailyToday,
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

    const hasWonDailyToday = await hasProfileWonDailyToday(ctx, existing._id);

    return buildPlayerProfile(existing, normalizeLanguage(existing.language), {
      hasWonDailyToday,
    });
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

    if (!existing) {
      return null;
    }

    const hasWonDailyToday = await hasProfileWonDailyToday(ctx, existing._id);
    return buildPlayerProfile(existing, normalizeLanguage(args.language), {
      hasWonDailyToday,
    });
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
    const modeIds: SupportedMode[] = ["classic", "lightning", "daily"];
    const orderedEvents = [...args.events]
      .filter(
        (event): event is RoundSyncEvent =>
          event.version === 2 || event.version === 3,
      )
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
    const profileEvents = (await ctx.db
      .query("scoreEvents")
      .withIndex("by_profile_id", (query) => query.eq("profileId", profile._id))
      .collect()) as ScoreEventRecord[];
    const awardedDailyWinDayKeys = new Set(
      profileEvents
        .filter((event) => isDailyWinWithAppliedPoints(event))
        .map((event) => toUTCDayKey(event.happenedAt)),
    );
    const modeStatsById = modeIds.reduce<Record<SupportedMode, LanguageStats>>(
      (accumulator, modeId) => {
        accumulator[modeId] = getModeStats(profile, language, modeId);
        return accumulator;
      },
      {
        classic: { score: 0, streak: 0, createdAt: profile.createdAt },
        lightning: { score: 0, streak: 0, createdAt: profile.createdAt },
        daily: { score: 0, streak: 0, createdAt: profile.createdAt },
      },
    );
    const touchedModeIds = new Set<SupportedMode>();
    let hasChanges = false;

    for (const event of orderedEvents) {
      const existingEvent = (await ctx.db
        .query("scoreEvents")
        .withIndex("by_event_id", (query) => query.eq("eventId", event.id))
        .first()) as ScoreEventRecord | null;

      if (existingEvent) {
        continue;
      }

      const modeId = normalizeModeId(event.modeId);
      const modeStats = modeStatsById[modeId];
      const clientPointsDelta =
        event.kind === "win" && typeof event.pointsDelta === "number"
          ? normalizeScore(event.pointsDelta)
          : undefined;
      let authoritativePointsDelta: number | undefined =
        event.kind === "win" && event.version === 2
          ? normalizeScore(event.pointsDelta)
          : undefined;
      let rejectionReason: string | undefined;

      if (event.kind === "win") {
        if (event.version === 3) {
          const v3Result = getAuthoritativeV3WinResult(
            event,
            modeId,
            modeStats.streak,
          );
          if (!v3Result.ok) {
            rejectionReason = v3Result.rejectionReason;
            authoritativePointsDelta = 0;
          } else {
            authoritativePointsDelta = v3Result.authoritativePointsDelta;
          }
        }

        if (
          !rejectionReason &&
          modeId === "daily" &&
          authoritativePointsDelta !== undefined &&
          authoritativePointsDelta > 0
        ) {
          const utcDayKey = toUTCDayKey(event.happenedAt);
          if (awardedDailyWinDayKeys.has(utcDayKey)) {
            rejectionReason = "daily-win-already-awarded";
            authoritativePointsDelta = 0;
          } else {
            awardedDailyWinDayKeys.add(utcDayKey);
          }
        }

        if (!rejectionReason) {
          const safePoints = normalizeScore(authoritativePointsDelta ?? 0);
          nextScore = normalizeScore(nextScore + safePoints);
          nextStreak += 1;
          modeStats.score = normalizeScore(modeStats.score + safePoints);
          modeStats.streak += 1;
          nextCreatedAt = Math.max(nextCreatedAt, event.happenedAt);
          modeStats.createdAt = Math.max(modeStats.createdAt, event.happenedAt);
          touchedModeIds.add(modeId);
          hasChanges = true;
        }
      } else {
        nextStreak = 0;
        modeStats.streak = 0;
        nextCreatedAt = Math.max(nextCreatedAt, event.happenedAt);
        modeStats.createdAt = Math.max(modeStats.createdAt, event.happenedAt);
        touchedModeIds.add(modeId);
        hasChanges = true;
      }

      await ctx.db.insert("scoreEvents", {
        profileId: profile._id,
        eventId: event.id,
        kind: event.kind,
        version: event.version,
        clientPointsDelta,
        modeId,
        pointsDelta:
          event.kind === "win"
            ? normalizeScore(authoritativePointsDelta ?? 0)
            : undefined,
        rejectionReason,
        happenedAt: event.happenedAt,
        createdAt: Date.now(),
      });
    }

    let nextPatch: Partial<ScoreRecord> = {
      ...withLanguageStats(profile, language, {
        score: nextScore,
        streak: nextStreak,
        createdAt: nextCreatedAt,
      }),
    };

    let patchSource: ScoreRecord = {
      ...profile,
      ...nextPatch,
    } as ScoreRecord;

    const modeIdsToPatch = hasChanges ? [...touchedModeIds] : modeIds;

    for (const modeId of modeIdsToPatch) {
      const modePatch = withModeStats(
        patchSource,
        language,
        modeId,
        modeStatsById[modeId],
      );
      nextPatch = {
        ...nextPatch,
        ...modePatch,
      };
      patchSource = {
        ...patchSource,
        ...modePatch,
      };
    }

    if (hasChanges) {
      await ctx.db.patch(profile._id, nextPatch);
    }

    const hasWonDailyToday = await hasProfileWonDailyToday(ctx, profile._id);

    return buildPlayerProfile(
      {
        ...profile,
        ...nextPatch,
      },
      language,
      {
        hasWonDailyToday,
      },
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
    modeId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientRecordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = normalizeLanguage(args.language);
    const modeId = normalizeModeId(args.modeId);
    const limit = Math.max(
      1,
      Math.min(MAX_LIMIT, Math.floor(args.limit ?? DEFAULT_LIMIT)),
    );

    const scores = (await ctx.db.query("scores").collect()) as ScoreRecord[];
    const byNick = new Map<string, ScoreRecord>();

    for (const entry of scores) {
      if (!hasModeStats(entry, language, modeId)) {
        continue;
      }

      const key = nickKey(entry.nick);
      const current = byNick.get(key);
      const entryStats = getModeStats(entry, language, modeId);
      const currentStats = current
        ? getModeStats(current, language, modeId)
        : null;

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
      const leftStats = getModeStats(left, language, modeId);
      const rightStats = getModeStats(right, language, modeId);
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
    const profilesToResolveDailyWinFor = [
      ...sortedScores.slice(0, limit).map((score) => score._id),
      ...(currentClientScore ? [currentClientScore._id] : []),
    ];
    const dailyWinnersTodayByProfileId = await getDailyWinnersTodayByProfileId(
      ctx,
      profilesToResolveDailyWinFor,
    );

    const mappedTopScores = sortedScores.slice(0, limit).map((score) => {
      const stats = getModeStats(score, language, modeId);
      return {
        id: score._id,
        nick: score.nick,
        language,
        modeId,
        score: stats.score,
        streak: normalizeStreak(stats.streak),
        hasWonDailyToday: dailyWinnersTodayByProfileId.get(score._id) === true,
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
            const stats = getModeStats(currentClientScore, language, modeId);
            return {
              id: currentClientScore._id,
              nick: currentClientScore.nick,
              language,
              modeId,
              score: stats.score,
              streak: normalizeStreak(stats.streak),
              hasWonDailyToday:
                dailyWinnersTodayByProfileId.get(currentClientScore._id) ===
                true,
              createdAt: stats.createdAt,
              isCurrentClient: true,
            };
          })()
        : null,
    };
  },
});
