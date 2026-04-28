import { ConvexGateway } from "../convex/ConvexGateway";
import {
  ADD_SCORE_MUTATION,
  CONSUME_DAILY_SHIELD_MUTATION,
  DEFAULT_LIMIT,
  GET_CURRENT_PLAYER_PROFILE_QUERY,
  GET_PLAYER_BY_CODE_QUERY,
  IS_NICK_AVAILABLE_QUERY,
  LIST_TOP_SCORES_QUERY,
  MAX_LIMIT,
  SCOREBOARD_CACHE_KEY,
  SCOREBOARD_CLIENT_ID_KEY,
  SCOREBOARD_PENDING_KEY,
  SCOREBOARD_PROFILE_IDENTITY_KEY,
  SYNC_ROUND_EVENTS_MUTATION,
  UPDATE_SCORE_MUTATION,
  UPSERT_PLAYER_PROFILE_MUTATION,
  WORDLE_SYNC_EVENTS_KEY,
} from "./constants";
import {
  DAILY_MODE_STATUS_STORAGE_KEY_PREFIX,
  DAILY_SHIELD_USED_STORAGE_KEY_PREFIX,
  SCOREBOARD_MODE_IDS,
  resolveScoreboardModeId,
} from "@domain/wordle";
import type {
  PlayerDifficulty,
  PlayerLanguage,
  RoundSyncWinProof,
  ScoreboardModeId,
} from "@domain/wordle";
import type {
  RecordScoreInput,
  RemoteModeProgress,
  RemotePlayerProfile,
  RemoteProgressByMode,
  RemoteScore,
  RemoteScoresResponse,
  ScoreEntry,
  ScoreSource,
  StoredScoreIdentity,
  StoredScore,
  StoredRoundSyncEvent,
  SyncRoundEventsInput,
  SyncPendingScoresResult,
  ConsumeDailyShieldInput,
  TopScoresResult,
  UpsertPlayerProfileInput,
} from "./types";
import { resolveStorage, scoreSorter } from "./utils";

class ScoreClient {
  private static readonly DEFAULT_LANGUAGE: PlayerLanguage = "en";
  private static readonly DEFAULT_MODE: ScoreboardModeId =
    SCOREBOARD_MODE_IDS.CLASSIC;
  private static readonly PROFILE_PROGRESS_MODE_IDS: ScoreboardModeId[] = [
    SCOREBOARD_MODE_IDS.CLASSIC,
    SCOREBOARD_MODE_IDS.LIGHTNING,
    SCOREBOARD_MODE_IDS.DAILY,
  ];

  private readonly gateway: ConvexGateway;
  private readonly storage: Storage;
  private readonly clientId: string;
  private static readonly PLAYER_STORAGE_KEY = "player";

  constructor(gateway: ConvexGateway, storage?: Storage) {
    this.gateway = gateway;
    this.storage = resolveStorage(storage);
    this.clientId = this.getOrCreateClientId();
  }

  async upsertPlayerProfile(
    input: UpsertPlayerProfileInput,
  ): Promise<RemotePlayerProfile> {
    this.assertRemoteIdentityAvailable();

    const language = this.normalizeLanguage(input.language);
    const currentRecord = this.getCurrentClientStoredScore(
      language,
      ScoreClient.DEFAULT_MODE,
    );
    const identity = this.readProfileIdentity();
    const normalizedScore = this.normalizeScore(input.score ?? 0);
    const normalizedStreak = this.normalizeStreak(input.streak ?? 0);
    const clientRecordId =
      identity?.clientRecordId ??
      currentRecord?.localId ??
      this.createLocalId(normalizedScore > 0 ? Date.now() : undefined);

    const response = await this.gateway.mutation<unknown>(
      UPSERT_PLAYER_PROFILE_MUTATION,
      {
        clientId: this.clientId,
        clientRecordId,
        nick: this.normalizeNick(input.nick),
        language,
        score: normalizedScore,
        streak: normalizedStreak,
        difficulty: input.difficulty,
        keyboardPreference: input.keyboardPreference,
      },
    );

    const profile = this.parseRemotePlayerProfile(response, {
      clientId: this.clientId,
      clientRecordId,
      nick: input.nick,
      language,
      score: normalizedScore,
      streak: normalizedStreak,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: Date.now(),
      playerCode: "",
    });

    this.adoptRecoveredIdentity(profile);
    return profile;
  }

  async recoverPlayerByCode(code: string): Promise<RemotePlayerProfile> {
    this.assertRemoteIdentityAvailable();

    const response = await this.gateway.query<unknown>(
      GET_PLAYER_BY_CODE_QUERY,
      {
        code: this.normalizeRecoveryCode(code),
      },
    );

    return this.parseRemotePlayerProfile(response, {
      clientId: null,
      clientRecordId: "",
      nick: "Player",
      language: ScoreClient.DEFAULT_LANGUAGE,
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: Date.now(),
      playerCode: this.normalizeRecoveryCode(code),
    });
  }

  async getCurrentPlayerProfile(
    language: PlayerLanguage = ScoreClient.DEFAULT_LANGUAGE,
  ): Promise<RemotePlayerProfile | null> {
    const identity = this.readProfileIdentity();
    const safeLanguage = this.normalizeLanguage(language);

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return null;
    }

    const response = await this.gateway.query<unknown>(
      GET_CURRENT_PLAYER_PROFILE_QUERY,
      {
        clientId: this.clientId,
        clientRecordId: identity?.clientRecordId,
        language: safeLanguage,
      },
    );

    if (response === null) {
      return null;
    }

    const profile = this.parseRemotePlayerProfile(response, {
      clientId: this.clientId,
      clientRecordId: identity?.clientRecordId ?? "",
      nick: "Player",
      language: safeLanguage,
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: Date.now(),
      playerCode: "",
    });

    this.adoptRecoveredIdentity(profile);
    return profile;
  }

  async consumeDailyShield(
    input: ConsumeDailyShieldInput,
  ): Promise<RemotePlayerProfile | null> {
    const identity = this.readProfileIdentity();
    const language = this.normalizeLanguage(input.language);
    const safeHappenedAt =
      typeof input.happenedAt === "number" &&
      Number.isFinite(input.happenedAt) &&
      input.happenedAt > 0
        ? Math.floor(input.happenedAt)
        : Date.now();

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return null;
    }

    try {
      const response = await this.gateway.mutation<unknown>(
        CONSUME_DAILY_SHIELD_MUTATION,
        {
          clientId: this.clientId,
          clientRecordId: identity?.clientRecordId,
          nick: this.normalizeNick(input.nick),
          language,
          difficulty: input.difficulty,
          keyboardPreference: input.keyboardPreference,
          playerCode:
            typeof input.playerCode === "string" &&
            input.playerCode.trim().length > 0
              ? this.normalizeRecoveryCode(input.playerCode)
              : undefined,
          happenedAt: safeHappenedAt,
        },
      );

      const profile = this.parseRemotePlayerProfile(response, {
        clientId: this.clientId,
        clientRecordId: identity?.clientRecordId ?? this.createLocalId(),
        nick: input.nick,
        language,
        score: 0,
        streak: 0,
        difficulty: input.difficulty,
        keyboardPreference: input.keyboardPreference,
        createdAt: safeHappenedAt,
        playerCode:
          typeof input.playerCode === "string" ? input.playerCode : "",
      });

      this.adoptRecoveredIdentity(profile);
      return profile;
    } catch {
      // The mutation may not exist yet in older backends; local state remains
      // source of truth until remote support is available.
      return null;
    }
  }

  queueRoundEvent(event: StoredRoundSyncEvent): void {
    const safeModeId = this.normalizeModeId(event.modeId);
    if (!this.isRemoteSupportedMode(safeModeId)) {
      return;
    }

    const pending = this.readRoundEvents();
    const next = pending.filter((entry) => entry.id !== event.id);
    if (event.kind === "win") {
      const happenedAt =
        Number.isFinite(event.happenedAt) && event.happenedAt > 0
          ? Math.floor(event.happenedAt)
          : Date.now();
      const normalizedWinEventBase = {
        ...event,
        pointsDelta: this.normalizeScore(event.pointsDelta),
        modeId: safeModeId,
        happenedAt,
      };

      if (event.version === 3) {
        const normalizedProof = this.toRoundSyncWinProof(event.proof);
        if (!normalizedProof) {
          return;
        }

        next.push({
          ...normalizedWinEventBase,
          version: 3,
          proof: normalizedProof,
        });
      } else {
        next.push({
          ...normalizedWinEventBase,
          version: 2,
        });
      }
    } else {
      next.push({
        ...event,
        modeId: safeModeId,
        happenedAt:
          Number.isFinite(event.happenedAt) && event.happenedAt > 0
            ? Math.floor(event.happenedAt)
            : Date.now(),
        version: 2,
      });
    }
    this.writeRoundEvents(next);
  }

  async syncRoundEvents(
    input: SyncRoundEventsInput,
  ): Promise<RemotePlayerProfile | null> {
    const events = this.readRoundEvents();
    const supportedEvents = events.filter((event) =>
      this.isRemoteSupportedMode(event.modeId),
    );
    if (supportedEvents.length !== events.length) {
      this.writeRoundEvents(supportedEvents);
    }

    const identity = this.readProfileIdentity();

    if (
      supportedEvents.length === 0 ||
      !this.gateway.isConfigured ||
      !this.isOnline()
    ) {
      return null;
    }

    const orderedEvents = [...supportedEvents].sort(
      (left, right) => left.happenedAt - right.happenedAt,
    );

    try {
      const response = await this.gateway.mutation<unknown>(
        SYNC_ROUND_EVENTS_MUTATION,
        {
          clientId: this.clientId,
          clientRecordId: identity?.clientRecordId,
          nick: this.normalizeNick(input.nick),
          language: this.normalizeLanguage(input.language),
          difficulty: input.difficulty,
          keyboardPreference: input.keyboardPreference,
          events: orderedEvents,
        },
      );
      const lastEvent = orderedEvents[orderedEvents.length - 1];
      const profile = this.parseRemotePlayerProfile(response, {
        clientId: this.clientId,
        clientRecordId: identity?.clientRecordId ?? this.createLocalId(),
        nick: input.nick,
        language: this.normalizeLanguage(input.language),
        score: 0,
        streak: 0,
        difficulty: input.difficulty,
        keyboardPreference: input.keyboardPreference,
        createdAt: lastEvent.happenedAt,
        playerCode: "",
      });

      this.clearRoundEvents();
      this.adoptRecoveredIdentity(profile);
      return profile;
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }

      return null;
    }
  }

  cachePlayerScore(input: RecordScoreInput): void {
    const identity = this.readProfileIdentity();
    const language = this.normalizeLanguage(input.language);
    const modeId = this.normalizeModeId(input.modeId);
    const createdAt = input.createdAt ?? Date.now();

    this.addToCache(
      {
        localId: identity?.clientRecordId ?? this.createLocalId(createdAt),
        clientId: this.clientId,
        nick: this.normalizeNick(input.nick),
        language,
        modeId,
        score: this.normalizeScore(input.score),
        streak: this.normalizeStreak(input.streak ?? 0),
        createdAt,
      },
      input.overwriteExisting === true,
    );
  }

  getCurrentClientScoreSnapshot(
    language: PlayerLanguage = ScoreClient.DEFAULT_LANGUAGE,
    modeId: ScoreboardModeId = ScoreClient.DEFAULT_MODE,
  ): Pick<StoredScore, "score" | "streak"> {
    const current = this.getCurrentClientStoredScore(
      this.normalizeLanguage(language),
      this.normalizeModeId(modeId),
    );

    return {
      score: current?.score ?? 0,
      streak: current?.streak ?? 0,
    };
  }

  adoptRecoveredIdentity(profile: RemotePlayerProfile): void {
    const previousIdentity = this.readProfileIdentity();
    const preserveModeScopedEntries =
      previousIdentity?.clientRecordId === profile.clientRecordId;
    this.writeProfileIdentity({ clientRecordId: profile.clientRecordId });
    this.replaceCurrentBrowserScores(profile, preserveModeScopedEntries);
  }

  async recordScore(
    input: RecordScoreInput,
    mutation: string = ADD_SCORE_MUTATION,
  ): Promise<void> {
    const language = this.normalizeLanguage(input.language);
    const modeId = this.normalizeModeId(input.modeId);
    const currentRecord = this.getCurrentClientStoredScore(language, modeId);
    const identity = this.readProfileIdentity();
    const overwriteExisting = input.overwriteExisting === true;
    const normalizedInputScore = this.normalizeScore(input.score);
    const score = overwriteExisting
      ? normalizedInputScore
      : currentRecord
        ? Math.max(currentRecord.score, normalizedInputScore)
        : normalizedInputScore;
    const streak =
      typeof input.streak === "number"
        ? this.normalizeStreak(input.streak)
        : (currentRecord?.streak ?? 0);
    const createdAt = currentRecord
      ? overwriteExisting
        ? (input.createdAt ??
          (score === currentRecord.score && streak === currentRecord.streak
            ? currentRecord.createdAt
            : Date.now()))
        : score <= currentRecord.score
          ? currentRecord.createdAt
          : (input.createdAt ?? Date.now())
      : (input.createdAt ?? Date.now());

    const record: StoredScore = {
      localId:
        identity?.clientRecordId ??
        currentRecord?.localId ??
        this.createLocalId(createdAt),
      clientId: this.clientId,
      nick: this.normalizeNick(input.nick),
      language,
      modeId,
      score,
      streak,
      createdAt,
    };

    this.addToCache(record, overwriteExisting);

    if (!this.isRemoteSupportedMode(modeId)) {
      return;
    }

    if (!this.gateway.isConfigured || !this.isOnline()) {
      this.addToPending(record, overwriteExisting, mutation);
      return;
    }

    try {
      await this.gateway.mutation(mutation, {
        clientRecordId: identity?.clientRecordId ?? record.localId,
        clientId: this.clientId,
        nick: record.nick,
        language: record.language,
        modeId: record.modeId,
        score: record.score,
        streak: record.streak,
        createdAt: record.createdAt,
      });
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }
      this.addToPending(record, overwriteExisting, mutation);
    }
  }

  async isNickAvailable(nick: string): Promise<boolean> {
    const normalizedNick = this.normalizeNick(nick);

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return this.isNickAvailableInLocalData(normalizedNick);
    }

    try {
      const remoteResult = await this.gateway.query<unknown>(
        IS_NICK_AVAILABLE_QUERY,
        {
          nick: normalizedNick,
          clientId: this.clientId,
          clientRecordId: this.readProfileIdentity()?.clientRecordId,
        },
      );

      if (typeof remoteResult === "boolean") {
        return remoteResult;
      }

      if (
        remoteResult &&
        typeof remoteResult === "object" &&
        "available" in remoteResult &&
        typeof (remoteResult as { available: unknown }).available === "boolean"
      ) {
        return (remoteResult as { available: boolean }).available;
      }

      return this.isNickAvailableInLocalData(normalizedNick);
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }

      return this.isNickAvailableInLocalData(normalizedNick);
    }
  }

  async listTopScores(
    limit = DEFAULT_LIMIT,
    language: PlayerLanguage = ScoreClient.DEFAULT_LANGUAGE,
    modeId: ScoreboardModeId = ScoreClient.DEFAULT_MODE,
  ): Promise<TopScoresResult> {
    const safeLanguage = this.normalizeLanguage(language);
    const safeModeId = this.normalizeModeId(modeId);
    const safeLimit = this.normalizeLimit(limit);
    const identity = this.readProfileIdentity();

    if (!this.isRemoteSupportedMode(safeModeId)) {
      return this.getCachedTopScores(safeLimit, safeLanguage, safeModeId);
    }

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return this.getCachedTopScores(safeLimit, safeLanguage, safeModeId);
    }

    try {
      const remoteResponse = await this.gateway.query<
        RemoteScoresResponse | RemoteScore[]
      >(LIST_TOP_SCORES_QUERY, {
        limit: safeLimit,
        language: safeLanguage,
        modeId: safeModeId,
        clientId: this.clientId,
        clientRecordId: identity?.clientRecordId,
      });
      const parsedResponse = this.parseRemoteScoresResponse(remoteResponse);
      const remoteModeMismatch = parsedResponse.scores.some(
        (entry) =>
          this.normalizeModeId(entry.modeId ?? safeModeId) !== safeModeId,
      );
      const remoteCurrentClientEntryModeMismatch =
        parsedResponse.currentClientEntry !== null &&
        this.normalizeModeId(
          parsedResponse.currentClientEntry.modeId ?? safeModeId,
        ) !== safeModeId;

      if (remoteModeMismatch || remoteCurrentClientEntryModeMismatch) {
        return this.getCachedTopScores(safeLimit, safeLanguage, safeModeId);
      }

      const mergedScores = this.mergeRemoteAndPending(
        parsedResponse.scores,
        safeLimit,
        safeLanguage,
        safeModeId,
      );
      const currentClientEntry =
        parsedResponse.currentClientEntry !== null
          ? this.toScoreEntry(
              parsedResponse.currentClientEntry,
              "convex",
              safeLanguage,
              safeModeId,
            )
          : (mergedScores.find((entry) => entry.isCurrentClient) ?? null);

      return {
        scores: mergedScores,
        source: "convex",
        currentClientRank: parsedResponse.currentClientRank,
        currentClientEntry,
      };
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }

      return this.getCachedTopScores(safeLimit, safeLanguage, safeModeId);
    }
  }

  getCachedTopScores(
    limit = DEFAULT_LIMIT,
    language: PlayerLanguage = ScoreClient.DEFAULT_LANGUAGE,
    modeId: ScoreboardModeId = ScoreClient.DEFAULT_MODE,
  ): TopScoresResult {
    const safeLanguage = this.normalizeLanguage(language);
    const safeModeId = this.normalizeModeId(modeId);
    const safeLimit = this.normalizeLimit(limit);
    const localScores = this.localScoresRanked(safeLanguage, safeModeId);
    const localResult = this.buildTopScoresResult(localScores, safeLimit);

    return {
      scores: localResult.scores,
      source: "local",
      currentClientRank: localResult.currentClientRank,
      currentClientEntry: localResult.currentClientEntry,
    };
  }

  async syncPendingScores(): Promise<SyncPendingScoresResult> {
    const pending = this.dedupeStoredByNick(
      this.readScores(SCOREBOARD_PENDING_KEY),
    );
    const supportedPending = pending.filter((entry) =>
      this.isRemoteSupportedMode(entry.modeId),
    );
    if (supportedPending.length !== pending.length) {
      this.writeScores(SCOREBOARD_PENDING_KEY, supportedPending);
    }

    if (
      supportedPending.length === 0 ||
      !this.gateway.isConfigured ||
      !this.isOnline()
    ) {
      return { flushed: false };
    }

    const stillPending: StoredScore[] = [];
    let networkDown = false;

    for (const entry of supportedPending) {
      if (networkDown) {
        stillPending.push(entry);
        continue;
      }

      try {
        await this.gateway.mutation(
          entry.mutation === UPDATE_SCORE_MUTATION
            ? UPDATE_SCORE_MUTATION
            : ADD_SCORE_MUTATION,
          {
            clientRecordId:
              this.readProfileIdentity()?.clientRecordId ?? entry.localId,
            clientId: this.clientId,
            nick: entry.nick,
            language: entry.language,
            modeId: entry.modeId,
            score: entry.score,
            streak: entry.streak,
            createdAt: entry.createdAt,
          },
        );
      } catch (error) {
        if (!this.gateway.isNetworkError(error)) {
          throw error;
        }

        networkDown = true;
        stillPending.push(entry);
      }
    }

    this.writeScores(
      SCOREBOARD_PENDING_KEY,
      this.dedupeStoredByNick(stillPending),
    );

    return { flushed: stillPending.length !== supportedPending.length };
  }

  private localScoresRanked(
    language: PlayerLanguage,
    modeId: ScoreboardModeId,
  ): ScoreEntry[] {
    return this.dedupeStoredByLocalId(
      this.dedupeStoredByNick(
        this.readScores(SCOREBOARD_CACHE_KEY).filter(
          (entry) => entry.language === language && entry.modeId === modeId,
        ),
      ),
    )
      .sort(scoreSorter)
      .map((entry) => this.toLocalScoreEntry(entry));
  }

  private mergeRemoteAndPending(
    remoteScores: RemoteScore[],
    limit: number,
    language: PlayerLanguage,
    modeId: ScoreboardModeId,
  ): ScoreEntry[] {
    const pending = this.dedupeStoredByNick(
      this.readScores(SCOREBOARD_PENDING_KEY).filter(
        (entry) => entry.language === language && entry.modeId === modeId,
      ),
    );
    const cachedCurrentClientScores = this.dedupeStoredByNick(
      this.readScores(SCOREBOARD_CACHE_KEY).filter(
        (entry) =>
          entry.language === language &&
          entry.modeId === modeId &&
          this.isCurrentBrowserEntryForAnyMode(entry),
      ),
    );

    const remoteEntries: ScoreEntry[] = remoteScores.map((entry) =>
      this.toScoreEntry(entry, "convex", language, modeId),
    );

    const pendingEntries: ScoreEntry[] = pending.map((entry) =>
      this.toLocalScoreEntry(entry),
    );
    const cachedCurrentClientEntries: ScoreEntry[] =
      cachedCurrentClientScores.map((entry) => this.toLocalScoreEntry(entry));

    return this.dedupeCurrentClientEntries(
      this.dedupeScoreEntriesByNick([
        ...remoteEntries,
        ...pendingEntries,
        ...cachedCurrentClientEntries,
      ]),
    )
      .sort((a, b) => scoreSorter(a, b))
      .slice(0, limit);
  }

  private toLocalScoreEntry(entry: StoredScore): ScoreEntry {
    const isCurrentBrowserEntry = this.isCurrentBrowserEntryForAnyMode(entry);

    return {
      id: entry.localId,
      nick: entry.nick,
      language: entry.language,
      modeId: this.normalizeModeId(entry.modeId),
      score: entry.score,
      streak: entry.streak,
      hasWonDailyToday:
        isCurrentBrowserEntry && this.hasCurrentBrowserWonDailyTodayLocally(),
      hasDailyShieldAvailableToday:
        isCurrentBrowserEntry &&
        this.hasCurrentBrowserDailyShieldAvailableTodayLocally(),
      createdAt: entry.createdAt,
      source: "local",
      isCurrentClient: !entry.clientId || entry.clientId === this.clientId,
    };
  }

  private toScoreEntry(
    entry: Pick<RemoteScore, "id" | "nick" | "score" | "createdAt"> &
      Partial<
        Pick<
          RemoteScore,
          | "isCurrentClient"
          | "streak"
          | "language"
          | "modeId"
          | "hasWonDailyToday"
          | "hasDailyShieldAvailableToday"
        >
      >,
    source: ScoreSource,
    defaultLanguage: PlayerLanguage,
    defaultModeId: ScoreboardModeId,
  ): ScoreEntry {
    return {
      id: entry.id,
      nick: entry.nick,
      language: this.normalizeLanguage(entry.language ?? defaultLanguage),
      modeId: this.normalizeModeId(entry.modeId ?? defaultModeId),
      score: entry.score,
      streak: this.normalizeStreak(entry.streak ?? 0),
      hasWonDailyToday: Boolean(entry.hasWonDailyToday),
      hasDailyShieldAvailableToday:
        typeof entry.hasDailyShieldAvailableToday === "boolean"
          ? entry.hasDailyShieldAvailableToday
          : undefined,
      createdAt: entry.createdAt,
      source,
      isCurrentClient: Boolean(entry.isCurrentClient),
    };
  }

  private parseRemoteScoresResponse(
    response: RemoteScoresResponse | RemoteScore[],
  ): {
    scores: RemoteScore[];
    currentClientRank: number | null;
    currentClientEntry: RemoteScore | null;
  } {
    if (Array.isArray(response)) {
      return {
        scores: response,
        currentClientRank: null,
        currentClientEntry: null,
      };
    }

    const normalizedRank =
      typeof response.currentClientRank === "number" &&
      Number.isFinite(response.currentClientRank) &&
      response.currentClientRank > 0
        ? Math.floor(response.currentClientRank)
        : null;

    return {
      scores: Array.isArray(response.scores) ? response.scores : [],
      currentClientRank: normalizedRank,
      currentClientEntry: response.currentClientEntry ?? null,
    };
  }

  private buildTopScoresResult(
    rankedScores: ScoreEntry[],
    limit: number,
  ): Pick<
    TopScoresResult,
    "scores" | "currentClientRank" | "currentClientEntry"
  > {
    const currentClientIndex = rankedScores.findIndex(
      (entry) => entry.isCurrentClient,
    );

    return {
      scores: rankedScores.slice(0, limit),
      currentClientRank:
        currentClientIndex >= 0 ? currentClientIndex + 1 : null,
      currentClientEntry:
        currentClientIndex >= 0 ? rankedScores[currentClientIndex] : null,
    };
  }

  private addToCache(entry: StoredScore, overwriteExisting = false): void {
    const baseEntries = overwriteExisting
      ? this.readScores(SCOREBOARD_CACHE_KEY).filter(
          (stored) => !this.shouldReplaceStoredEntryOnOverwrite(stored, entry),
        )
      : this.readScores(SCOREBOARD_CACHE_KEY);
    const cache = this.dedupeStoredByNick([...baseEntries, entry]);

    this.writeScores(SCOREBOARD_CACHE_KEY, cache.slice(0, 200));
  }

  private addToPending(
    entry: StoredScore,
    overwriteExisting = false,
    mutation = ADD_SCORE_MUTATION,
  ): void {
    const normalizedMutation =
      mutation === UPDATE_SCORE_MUTATION
        ? UPDATE_SCORE_MUTATION
        : ADD_SCORE_MUTATION;
    const pendingEntry = { ...entry, mutation: normalizedMutation };
    const baseEntries = overwriteExisting
      ? this.readScores(SCOREBOARD_PENDING_KEY).filter(
          (stored) =>
            !this.shouldReplaceStoredEntryOnOverwrite(stored, pendingEntry),
        )
      : this.readScores(SCOREBOARD_PENDING_KEY);
    const pending = this.dedupeStoredByNick([...baseEntries, pendingEntry]);
    this.writeScores(SCOREBOARD_PENDING_KEY, pending);
  }

  private shouldReplaceStoredEntryOnOverwrite(
    stored: StoredScore,
    nextEntry: StoredScore,
  ): boolean {
    const sameNickLanguageAndMode =
      this.nickLanguageModeKey(stored.nick, stored.language, stored.modeId) ===
      this.nickLanguageModeKey(
        nextEntry.nick,
        nextEntry.language,
        nextEntry.modeId,
      );
    const sameClient =
      Boolean(nextEntry.clientId) &&
      stored.clientId === nextEntry.clientId &&
      stored.language === nextEntry.language &&
      stored.modeId === nextEntry.modeId;
    const sameLocalId =
      stored.localId === nextEntry.localId &&
      stored.language === nextEntry.language &&
      stored.modeId === nextEntry.modeId;

    return sameNickLanguageAndMode || sameClient || sameLocalId;
  }

  private readScores(key: string): StoredScore[] {
    try {
      const raw = this.storage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.flatMap((entry) => {
        const normalized = this.toStoredScore(entry);
        return normalized ? [normalized] : [];
      });
    } catch {
      return [];
    }
  }

  private writeScores(key: string, scores: StoredScore[]): void {
    this.storage.setItem(key, JSON.stringify(scores));
  }

  private readRoundEvents(): StoredRoundSyncEvent[] {
    try {
      const raw = this.storage.getItem(WORDLE_SYNC_EVENTS_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.flatMap((entry) => {
        const normalized = this.toStoredRoundSyncEvent(entry);
        return normalized ? [normalized] : [];
      });
    } catch {
      return [];
    }
  }

  private writeRoundEvents(events: StoredRoundSyncEvent[]): void {
    this.storage.setItem(
      WORDLE_SYNC_EVENTS_KEY,
      JSON.stringify(
        events.sort((left, right) => left.happenedAt - right.happenedAt),
      ),
    );
  }

  private clearRoundEvents(): void {
    this.storage.removeItem(WORDLE_SYNC_EVENTS_KEY);
  }

  private normalizeNick(nick: string): string {
    const trimmed = nick.trim();
    if (trimmed.length === 0) {
      return "Player";
    }

    return trimmed.slice(0, 30);
  }

  private nickKey(nick: string): string {
    return this.normalizeNick(nick).toLowerCase();
  }

  private normalizeLanguage(value: unknown): PlayerLanguage {
    if (value === "es") {
      return "es";
    }

    return "en";
  }

  private normalizeModeId(value: unknown): ScoreboardModeId {
    return resolveScoreboardModeId(
      typeof value === "string" ? value : undefined,
    );
  }

  private isRemoteSupportedMode(modeId: ScoreboardModeId): boolean {
    return (
      modeId === SCOREBOARD_MODE_IDS.CLASSIC ||
      modeId === SCOREBOARD_MODE_IDS.LIGHTNING ||
      modeId === SCOREBOARD_MODE_IDS.DAILY
    );
  }

  private nickLanguageModeKey(
    nick: string,
    language: PlayerLanguage,
    modeId: ScoreboardModeId,
  ): string {
    return `${this.nickKey(nick)}::${this.normalizeLanguage(
      language,
    )}::${this.normalizeModeId(modeId)}`;
  }

  private normalizeScore(score: number): number {
    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.max(0, Math.floor(score));
  }

  private normalizeStreak(streak: number): number {
    if (!Number.isFinite(streak)) {
      return 0;
    }

    return Math.max(0, Math.floor(streak));
  }

  private normalizeDifficulty(value: unknown): PlayerDifficulty {
    if (value === "easy") {
      return "easy";
    }

    if (value === "hard") {
      return "hard";
    }

    if (value === "insane") {
      return "insane";
    }

    return "normal";
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
      return DEFAULT_LIMIT;
    }

    return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
  }

  private createLocalId(createdAt?: number): string {
    const baseTime = createdAt ?? Date.now();
    return `${baseTime}-${this.createIdentifier()}`;
  }

  private getOrCreateClientId(): string {
    const existing = this.storage.getItem(SCOREBOARD_CLIENT_ID_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }

    const created = this.createIdentifier();
    this.storage.setItem(SCOREBOARD_CLIENT_ID_KEY, created);
    return created;
  }

  private createIdentifier(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return Math.random().toString(36).slice(2);
  }

  private toStoredRoundSyncEvent(value: unknown): StoredRoundSyncEvent | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as {
      id?: unknown;
      kind?: unknown;
      pointsDelta?: unknown;
      modeId?: unknown;
      happenedAt?: unknown;
      version?: unknown;
      proof?: unknown;
    };
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.kind !== "string"
    ) {
      return null;
    }

    if (
      candidate.kind === "win" &&
      typeof candidate.pointsDelta === "number" &&
      typeof candidate.happenedAt === "number"
    ) {
      const modeId = this.normalizeModeId(candidate.modeId);
      if (!this.isRemoteSupportedMode(modeId)) {
        return null;
      }

      const safeHappenedAt = Math.floor(candidate.happenedAt);
      if (candidate.version === 3) {
        const normalizedProof = this.toRoundSyncWinProof(candidate.proof);
        if (!normalizedProof) {
          return null;
        }

        return {
          id: candidate.id,
          kind: "win",
          pointsDelta: this.normalizeScore(candidate.pointsDelta),
          modeId,
          happenedAt: safeHappenedAt,
          version: 3,
          proof: normalizedProof,
        };
      }

      return {
        id: candidate.id,
        kind: "win",
        pointsDelta: this.normalizeScore(candidate.pointsDelta),
        modeId,
        happenedAt: safeHappenedAt,
        version: 2,
      };
    }

    if (candidate.kind === "loss" && typeof candidate.happenedAt === "number") {
      const modeId = this.normalizeModeId(candidate.modeId);
      if (!this.isRemoteSupportedMode(modeId)) {
        return null;
      }

      return {
        id: candidate.id,
        kind: "loss",
        modeId,
        happenedAt: Math.floor(candidate.happenedAt),
        version: 2,
      };
    }

    return null;
  }

  private toRoundSyncWinProof(value: unknown): RoundSyncWinProof | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as Partial<RoundSyncWinProof>;
    if (
      typeof candidate.roundStartedAt !== "number" ||
      typeof candidate.guessesUsed !== "number" ||
      typeof candidate.hardModeEnabled !== "boolean" ||
      typeof candidate.hardModeSecondsLeft !== "number" ||
      !Array.isArray(candidate.guessWords)
    ) {
      return null;
    }

    const roundStartedAt = Math.floor(candidate.roundStartedAt);
    if (!Number.isFinite(roundStartedAt) || roundStartedAt <= 0) {
      return null;
    }

    const guessesUsed = Math.floor(candidate.guessesUsed);
    if (!Number.isFinite(guessesUsed) || guessesUsed <= 0) {
      return null;
    }

    const rawHardModeSecondsLeft = Math.floor(candidate.hardModeSecondsLeft);
    if (!Number.isFinite(rawHardModeSecondsLeft)) {
      return null;
    }

    const hardModeSecondsLeft = Math.max(0, rawHardModeSecondsLeft);

    const guessWords = candidate.guessWords
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim().toUpperCase())
      .filter((entry) => entry.length > 0);

    if (guessWords.length === 0) {
      return null;
    }

    return {
      roundStartedAt,
      guessesUsed,
      difficulty: this.normalizeDifficulty(candidate.difficulty),
      hardModeEnabled: candidate.hardModeEnabled,
      hardModeSecondsLeft,
      guessWords,
    };
  }

  private toStoredScore(value: unknown): StoredScore | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as Partial<StoredScore>;
    if (
      typeof candidate.localId !== "string" ||
      (candidate.clientId !== undefined &&
        typeof candidate.clientId !== "string") ||
      typeof candidate.nick !== "string" ||
      typeof candidate.score !== "number" ||
      typeof candidate.createdAt !== "number"
    ) {
      return null;
    }

    return {
      localId: candidate.localId,
      clientId: candidate.clientId,
      nick: candidate.nick,
      language: this.normalizeLanguage(candidate.language),
      modeId: this.normalizeModeId(candidate.modeId),
      score: this.normalizeScore(candidate.score),
      streak: this.normalizeStreak(candidate.streak ?? 0),
      createdAt: candidate.createdAt,
      mutation:
        typeof candidate.mutation === "string" ? candidate.mutation : undefined,
    };
  }

  private dedupeStoredByNick(entries: StoredScore[]): StoredScore[] {
    const byNick = new Map<string, StoredScore>();

    for (const entry of entries) {
      const key = this.nickLanguageModeKey(
        entry.nick,
        entry.language,
        entry.modeId,
      );
      const current = byNick.get(key);
      const comparison = current ? scoreSorter(entry, current) : 0;

      if (!current || comparison < 0) {
        byNick.set(key, entry);
        continue;
      }

      if (comparison === 0) {
        byNick.set(key, entry);
      }
    }

    return [...byNick.values()];
  }

  private dedupeStoredByLocalId(entries: StoredScore[]): StoredScore[] {
    const byLocalId = new Map<string, StoredScore>();

    for (const entry of entries) {
      byLocalId.set(entry.localId, entry);
    }

    return [...byLocalId.values()];
  }

  private getCurrentClientStoredScore(
    language: PlayerLanguage,
    modeId: ScoreboardModeId,
  ): StoredScore | null {
    const identity = this.readProfileIdentity();
    const isCurrentClientEntry = (entry: StoredScore): boolean =>
      entry.language === language &&
      entry.modeId === modeId &&
      (entry.clientId === this.clientId ||
        (identity !== null && entry.localId === identity.clientRecordId));

    const cacheEntries =
      this.readScores(SCOREBOARD_CACHE_KEY).filter(isCurrentClientEntry);

    if (cacheEntries.length > 0) {
      return this.pickCurrentClientSnapshot(cacheEntries);
    }

    const pendingEntries = this.readScores(SCOREBOARD_PENDING_KEY).filter(
      isCurrentClientEntry,
    );

    return this.pickCurrentClientSnapshot(pendingEntries);
  }

  private pickCurrentClientSnapshot(
    entries: StoredScore[],
  ): StoredScore | null {
    let current: StoredScore | null = null;

    for (const entry of entries) {
      if (!current || this.shouldPreferCurrentClientSnapshot(entry, current)) {
        current = entry;
      }
    }

    return current;
  }

  private shouldPreferCurrentClientSnapshot(
    candidate: Pick<StoredScore, "score" | "createdAt" | "streak">,
    current: Pick<StoredScore, "score" | "createdAt" | "streak">,
  ): boolean {
    if (candidate.score !== current.score) {
      return candidate.score > current.score;
    }

    if (candidate.createdAt !== current.createdAt) {
      return candidate.createdAt > current.createdAt;
    }

    return false;
  }

  private dedupeScoreEntriesByNick(entries: ScoreEntry[]): ScoreEntry[] {
    const byNick = new Map<string, ScoreEntry>();
    const mergeShieldAvailability = (
      preferred: ScoreEntry,
      candidate: ScoreEntry,
    ): boolean | undefined => {
      const preferredAvailability = preferred.hasDailyShieldAvailableToday;
      const candidateAvailability = candidate.hasDailyShieldAvailableToday;

      if (
        typeof preferredAvailability === "boolean" &&
        typeof candidateAvailability === "boolean"
      ) {
        return preferredAvailability && candidateAvailability;
      }

      if (typeof preferredAvailability === "boolean") {
        return preferredAvailability;
      }

      if (typeof candidateAvailability === "boolean") {
        return candidateAvailability;
      }

      return undefined;
    };

    for (const entry of entries) {
      const key = this.nickLanguageModeKey(
        entry.nick,
        entry.language,
        entry.modeId,
      );
      const current = byNick.get(key);
      const mergeDailyWinToday = (
        preferred: ScoreEntry,
        candidate: ScoreEntry,
      ): ScoreEntry => ({
        ...preferred,
        hasWonDailyToday:
          Boolean(preferred.hasWonDailyToday) ||
          Boolean(candidate.hasWonDailyToday),
        hasDailyShieldAvailableToday: mergeShieldAvailability(
          preferred,
          candidate,
        ),
      });

      if (!current) {
        byNick.set(key, entry);
        continue;
      }

      if (scoreSorter(entry, current) < 0) {
        byNick.set(key, mergeDailyWinToday(entry, current));
        continue;
      }

      if (
        scoreSorter(entry, current) === 0 &&
        entry.isCurrentClient &&
        (!current.isCurrentClient ||
          (entry.source === "local" && current.source !== "local"))
      ) {
        byNick.set(key, mergeDailyWinToday(entry, current));
        continue;
      }

      if (
        scoreSorter(entry, current) === 0 &&
        entry.source === "convex" &&
        current.source !== "convex"
      ) {
        byNick.set(key, mergeDailyWinToday(entry, current));
        continue;
      }

      if (
        entry.hasWonDailyToday === true &&
        current.hasWonDailyToday !== true
      ) {
        byNick.set(key, {
          ...current,
          hasWonDailyToday: true,
          hasDailyShieldAvailableToday: mergeShieldAvailability(entry, current),
        });
        continue;
      }

      const mergedShieldAvailability = mergeShieldAvailability(entry, current);
      if (
        typeof mergedShieldAvailability === "boolean" &&
        mergedShieldAvailability !== current.hasDailyShieldAvailableToday
      ) {
        byNick.set(key, {
          ...current,
          hasDailyShieldAvailableToday: mergedShieldAvailability,
        });
      }
    }

    return [...byNick.values()];
  }

  private dedupeCurrentClientEntries(entries: ScoreEntry[]): ScoreEntry[] {
    const currentClientEntries = entries.filter(
      (entry) => entry.isCurrentClient,
    );

    if (currentClientEntries.length <= 1) {
      return entries;
    }

    let preferred = currentClientEntries[0];

    for (let index = 1; index < currentClientEntries.length; index += 1) {
      const candidate = currentClientEntries[index];

      if (candidate.score > preferred.score) {
        preferred = candidate;
        continue;
      }

      if (candidate.score < preferred.score) {
        continue;
      }

      if (candidate.createdAt > preferred.createdAt) {
        preferred = candidate;
        continue;
      }

      if (candidate.createdAt < preferred.createdAt) {
        continue;
      }

      if (candidate.source === "local" && preferred.source !== "local") {
        preferred = candidate;
        continue;
      }

      preferred = candidate;
    }

    const hasAnyDailyWinToday = currentClientEntries.some(
      (entry) => entry.hasWonDailyToday === true,
    );
    const hasAnyShieldAvailabilitySignal = currentClientEntries.some(
      (entry) => typeof entry.hasDailyShieldAvailableToday === "boolean",
    );
    const hasDailyShieldAvailableToday = hasAnyShieldAvailabilitySignal
      ? currentClientEntries.every(
          (entry) => entry.hasDailyShieldAvailableToday !== false,
        ) &&
        currentClientEntries.some(
          (entry) => entry.hasDailyShieldAvailableToday === true,
        )
      : undefined;

    return entries
      .filter((entry) => !entry.isCurrentClient || entry === preferred)
      .map((entry) => {
        if (entry !== preferred) {
          return entry;
        }

        return {
          ...entry,
          hasWonDailyToday: hasAnyDailyWinToday ? true : entry.hasWonDailyToday,
          hasDailyShieldAvailableToday:
            typeof hasDailyShieldAvailableToday === "boolean"
              ? hasDailyShieldAvailableToday
              : entry.hasDailyShieldAvailableToday,
        };
      });
  }

  private isNickAvailableInLocalData(nick: string): boolean {
    const requestedKey = this.nickKey(nick);
    const identity = this.readProfileIdentity();

    return ![
      ...this.readScores(SCOREBOARD_CACHE_KEY),
      ...this.readScores(SCOREBOARD_PENDING_KEY),
    ].some(
      (entry) =>
        this.nickKey(entry.nick) === requestedKey &&
        entry.clientId !== this.clientId &&
        entry.localId !== identity?.clientRecordId,
    );
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }

  private hasCurrentBrowserWonDailyTodayLocally(): boolean {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const keysToCheck = this.resolveDailyStatusStorageKeysForCurrentPlayer();

      for (const key of keysToCheck) {
        const raw = this.storage.getItem(key);
        if (!raw) {
          continue;
        }

        let parsed: { date?: unknown; outcome?: unknown } | null = null;
        try {
          parsed = JSON.parse(raw) as {
            date?: unknown;
            outcome?: unknown;
          };
        } catch {
          parsed = null;
        }

        if (parsed?.date === today && parsed?.outcome === "won") {
          return true;
        }
      }
    } catch {
      return false;
    }

    return false;
  }

  private hasCurrentBrowserDailyShieldAvailableTodayLocally(): boolean {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const statusKeysToCheck =
        this.resolveDailyStatusStorageKeysForCurrentPlayer();

      for (const statusKey of statusKeysToCheck) {
        const statusRaw = this.storage.getItem(statusKey);
        if (!statusRaw) {
          continue;
        }

        let statusParsed: { date?: unknown; outcome?: unknown } | null = null;
        try {
          statusParsed = JSON.parse(statusRaw) as {
            date?: unknown;
            outcome?: unknown;
          };
        } catch {
          statusParsed = null;
        }

        if (statusParsed?.date !== today || statusParsed?.outcome !== "won") {
          continue;
        }

        const keySuffix =
          statusKey === DAILY_MODE_STATUS_STORAGE_KEY_PREFIX
            ? ""
            : statusKey.slice(DAILY_MODE_STATUS_STORAGE_KEY_PREFIX.length);
        const shieldUsageKey = `${DAILY_SHIELD_USED_STORAGE_KEY_PREFIX}${keySuffix}`;
        const shieldUsageRaw = this.storage.getItem(shieldUsageKey);

        if (!shieldUsageRaw) {
          return true;
        }

        let shieldUsageParsed: { date?: unknown; used?: unknown } | null = null;
        try {
          shieldUsageParsed = JSON.parse(shieldUsageRaw) as {
            date?: unknown;
            used?: unknown;
          };
        } catch {
          shieldUsageParsed = null;
        }

        const shieldUsedToday =
          shieldUsageParsed?.date === today && shieldUsageParsed?.used === true;
        if (!shieldUsedToday) {
          return true;
        }
      }
    } catch {
      return false;
    }

    return false;
  }

  private resolveDailyStatusStorageKeysForCurrentPlayer(): string[] {
    const currentPlayerCode = this.readCurrentPlayerCode();
    if (!currentPlayerCode) {
      return [DAILY_MODE_STATUS_STORAGE_KEY_PREFIX];
    }

    return [
      `${DAILY_MODE_STATUS_STORAGE_KEY_PREFIX}:${currentPlayerCode}`,
      DAILY_MODE_STATUS_STORAGE_KEY_PREFIX,
    ];
  }

  private readCurrentPlayerCode(): string | null {
    try {
      const rawPlayer = this.storage.getItem(ScoreClient.PLAYER_STORAGE_KEY);
      if (!rawPlayer) {
        return null;
      }

      const parsed = JSON.parse(rawPlayer) as { code?: unknown };
      if (typeof parsed.code !== "string") {
        return null;
      }

      const normalizedCode = this.normalizeRecoveryCode(parsed.code);
      return normalizedCode.length > 0 ? normalizedCode : null;
    } catch {
      return null;
    }
  }

  private normalizeRecoveryCode(code: string): string {
    return code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);
  }

  private parseRemotePlayerProfile(
    value: unknown,
    fallback: Omit<RemotePlayerProfile, "id">,
  ): RemotePlayerProfile {
    if (!value || typeof value !== "object") {
      throw new Error("Profile sync returned an invalid response.");
    }

    const candidate = value as Partial<RemotePlayerProfile>;
    if (typeof candidate.id !== "string") {
      throw new Error("Profile sync returned an invalid response.");
    }

    const clientRecordId =
      typeof candidate.clientRecordId === "string" &&
      candidate.clientRecordId.length > 0
        ? candidate.clientRecordId
        : fallback.clientRecordId;

    if (clientRecordId.length === 0) {
      throw new Error("Profile sync returned a profile without identity.");
    }

    const normalizedFallbackScore = this.normalizeScore(fallback.score);
    const normalizedFallbackStreak = this.normalizeStreak(fallback.streak);
    const fallbackCreatedAt =
      Number.isFinite(fallback.createdAt) && fallback.createdAt > 0
        ? Math.floor(fallback.createdAt)
        : Date.now();
    const normalizedCandidateScore =
      typeof candidate.score === "number"
        ? this.normalizeScore(candidate.score)
        : normalizedFallbackScore;
    const normalizedCandidateStreak =
      typeof candidate.streak === "number"
        ? this.normalizeStreak(candidate.streak)
        : normalizedFallbackStreak;
    const normalizedCandidateCreatedAt =
      typeof candidate.createdAt === "number" &&
      Number.isFinite(candidate.createdAt) &&
      candidate.createdAt > 0
        ? Math.floor(candidate.createdAt)
        : fallbackCreatedAt;
    const progressByMode = this.parseRemoteProgressByMode(
      candidate.progressByMode,
      {
        score: normalizedCandidateScore,
        streak: normalizedCandidateStreak,
        updatedAt: normalizedCandidateCreatedAt,
      },
    );
    const classicProgress = progressByMode[SCOREBOARD_MODE_IDS.CLASSIC];

    return {
      id: candidate.id,
      clientId:
        typeof candidate.clientId === "string" ? candidate.clientId : null,
      clientRecordId,
      nick:
        typeof candidate.nick === "string"
          ? this.normalizeNick(candidate.nick)
          : this.normalizeNick(fallback.nick),
      playerCode:
        typeof candidate.playerCode === "string"
          ? this.normalizeRecoveryCode(candidate.playerCode)
          : this.normalizeRecoveryCode(fallback.playerCode),
      language: this.normalizeLanguage(candidate.language ?? fallback.language),
      score: classicProgress?.score ?? normalizedCandidateScore,
      streak: classicProgress?.streak ?? normalizedCandidateStreak,
      hasWonDailyToday:
        typeof candidate.hasWonDailyToday === "boolean"
          ? candidate.hasWonDailyToday
          : Boolean(fallback.hasWonDailyToday),
      hasDailyShieldAvailableToday:
        typeof candidate.hasDailyShieldAvailableToday === "boolean"
          ? candidate.hasDailyShieldAvailableToday
          : typeof fallback.hasDailyShieldAvailableToday === "boolean"
            ? fallback.hasDailyShieldAvailableToday
            : undefined,
      difficulty:
        candidate.difficulty === "easy" ||
        candidate.difficulty === "normal" ||
        candidate.difficulty === "hard" ||
        candidate.difficulty === "insane"
          ? candidate.difficulty
          : fallback.difficulty,
      keyboardPreference:
        candidate.keyboardPreference === "onscreen" ||
        candidate.keyboardPreference === "native"
          ? candidate.keyboardPreference
          : fallback.keyboardPreference,
      createdAt: classicProgress?.updatedAt ?? normalizedCandidateCreatedAt,
      progressByMode,
    };
  }

  private toRemoteModeProgress(
    value: unknown,
    fallback: RemoteModeProgress,
  ): RemoteModeProgress | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as Partial<RemoteModeProgress> & {
      createdAt?: unknown;
    };
    const score =
      typeof candidate.score === "number"
        ? this.normalizeScore(candidate.score)
        : null;
    const streak =
      typeof candidate.streak === "number"
        ? this.normalizeStreak(candidate.streak)
        : null;

    if (score === null && streak === null) {
      return null;
    }

    const updatedAt =
      typeof candidate.updatedAt === "number" &&
      Number.isFinite(candidate.updatedAt) &&
      candidate.updatedAt > 0
        ? Math.floor(candidate.updatedAt)
        : typeof candidate.createdAt === "number" &&
            Number.isFinite(candidate.createdAt) &&
            candidate.createdAt > 0
          ? Math.floor(candidate.createdAt)
          : fallback.updatedAt;

    return {
      score: score ?? fallback.score,
      streak: streak ?? fallback.streak,
      updatedAt,
    };
  }

  private parseRemoteProgressByMode(
    value: unknown,
    classicFallback: RemoteModeProgress,
  ): RemoteProgressByMode {
    const progressByMode: RemoteProgressByMode = {
      [SCOREBOARD_MODE_IDS.CLASSIC]: classicFallback,
    };

    if (!value || typeof value !== "object") {
      return progressByMode;
    }

    const candidate = value as Record<string, unknown>;
    for (const modeId of ScoreClient.PROFILE_PROGRESS_MODE_IDS) {
      const fallback =
        modeId === SCOREBOARD_MODE_IDS.CLASSIC
          ? classicFallback
          : {
              score: 0,
              streak: 0,
              updatedAt: classicFallback.updatedAt,
            };
      const parsed = this.toRemoteModeProgress(candidate[modeId], fallback);
      if (parsed) {
        progressByMode[modeId] = parsed;
      }
    }

    return progressByMode;
  }

  private readProfileIdentity(): StoredScoreIdentity | null {
    try {
      const raw = this.storage.getItem(SCOREBOARD_PROFILE_IDENTITY_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<StoredScoreIdentity>;
      if (
        !parsed ||
        typeof parsed.clientRecordId !== "string" ||
        parsed.clientRecordId.length === 0
      ) {
        return null;
      }

      return { clientRecordId: parsed.clientRecordId };
    } catch {
      return null;
    }
  }

  private writeProfileIdentity(identity: StoredScoreIdentity): void {
    this.storage.setItem(
      SCOREBOARD_PROFILE_IDENTITY_KEY,
      JSON.stringify(identity),
    );
  }

  private resolveProfileModeCacheEntries(
    profile: RemotePlayerProfile,
    localEntries: StoredScore[],
  ): StoredScore[] {
    const fallbackProgress: RemoteModeProgress = {
      score: profile.score,
      streak: profile.streak,
      updatedAt: profile.createdAt,
    };
    const progressByMode: RemoteProgressByMode = profile.progressByMode ?? {
      [SCOREBOARD_MODE_IDS.CLASSIC]: fallbackProgress,
    };
    const remoteEntries = ScoreClient.PROFILE_PROGRESS_MODE_IDS.flatMap(
      (modeId) => {
        const progress = progressByMode[modeId];
        if (!progress) {
          return [];
        }

        return [
          {
            localId: profile.clientRecordId,
            clientId: this.clientId,
            nick: profile.nick,
            language: profile.language,
            modeId,
            score: this.normalizeScore(progress.score),
            streak: this.normalizeStreak(progress.streak),
            createdAt:
              Number.isFinite(progress.updatedAt) && progress.updatedAt > 0
                ? Math.floor(progress.updatedAt)
                : profile.createdAt,
          } satisfies StoredScore,
        ];
      },
    );

    const baseEntries =
      remoteEntries.length > 0
        ? remoteEntries
        : [
            {
              localId: profile.clientRecordId,
              clientId: this.clientId,
              nick: profile.nick,
              language: profile.language,
              modeId: SCOREBOARD_MODE_IDS.CLASSIC,
              score: profile.score,
              streak: profile.streak,
              createdAt: profile.createdAt,
            } satisfies StoredScore,
          ];

    return baseEntries.map((remoteEntry) => {
      const localSnapshot = this.pickCurrentClientSnapshot(
        localEntries.filter((entry) => entry.modeId === remoteEntry.modeId),
      );

      if (
        localSnapshot &&
        this.shouldPreferCurrentClientSnapshot(localSnapshot, remoteEntry)
      ) {
        return {
          ...localSnapshot,
          localId: profile.clientRecordId,
          clientId: this.clientId,
          nick: profile.nick,
          language: profile.language,
          modeId: remoteEntry.modeId,
        };
      }

      return remoteEntry;
    });
  }

  private replaceCurrentBrowserScores(
    profile: RemotePlayerProfile,
    preserveModeScopedEntries: boolean,
  ): void {
    const cacheEntries = this.readScores(SCOREBOARD_CACHE_KEY);
    const pendingEntries = this.readScores(SCOREBOARD_PENDING_KEY);
    const localCurrentLanguageEntries = [
      ...cacheEntries,
      ...pendingEntries,
    ].filter(
      (entry) =>
        this.isCurrentBrowserEntryForAnyMode(entry) &&
        entry.language === profile.language,
    );
    const nextEntries = this.resolveProfileModeCacheEntries(
      profile,
      localCurrentLanguageEntries,
    );
    const syncedModeIds = new Set(nextEntries.map((entry) => entry.modeId));
    const preserveModeEntries = (entry: StoredScore): boolean =>
      preserveModeScopedEntries &&
      this.isCurrentBrowserEntryForAnyMode(entry) &&
      entry.language === profile.language &&
      !syncedModeIds.has(entry.modeId);
    const normalizePreservedModeEntry = (entry: StoredScore): StoredScore => ({
      ...entry,
      localId: profile.clientRecordId,
      clientId: this.clientId,
      nick: profile.nick,
      language: profile.language,
    });
    const shouldDropCurrentEntry = (entry: StoredScore): boolean =>
      preserveModeScopedEntries
        ? this.isCurrentBrowserEntryForAnyMode(entry) &&
          entry.language === profile.language
        : this.isCurrentBrowserEntryForAnyMode(entry);
    const preservedCacheEntries = cacheEntries
      .filter(preserveModeEntries)
      .map(normalizePreservedModeEntry);
    const preservedPendingEntries = pendingEntries
      .filter(preserveModeEntries)
      .map(normalizePreservedModeEntry);
    const cache = [
      ...cacheEntries.filter((entry) => !shouldDropCurrentEntry(entry)),
      ...preservedCacheEntries,
      ...nextEntries,
    ];
    const pending = [
      ...pendingEntries.filter((entry) => !shouldDropCurrentEntry(entry)),
      ...preservedPendingEntries,
    ];

    this.writeScores(SCOREBOARD_CACHE_KEY, this.dedupeStoredByNick(cache));
    this.writeScores(SCOREBOARD_PENDING_KEY, this.dedupeStoredByNick(pending));
  }

  private isCurrentBrowserEntryForAnyMode(entry: StoredScore): boolean {
    const identity = this.readProfileIdentity();

    return (
      entry.clientId === this.clientId ||
      entry.localId === identity?.clientRecordId
    );
  }

  private assertRemoteIdentityAvailable(): void {
    if (!this.gateway.isConfigured || !this.isOnline()) {
      throw new Error("Profile sync is unavailable right now.");
    }
  }
}

export { ScoreClient };
