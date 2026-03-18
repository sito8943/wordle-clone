import { ConvexGateway } from "../convex/ConvexGateway";
import {
  ADD_SCORE_MUTATION,
  DEFAULT_LIMIT,
  GET_PLAYER_BY_CODE_QUERY,
  IS_NICK_AVAILABLE_QUERY,
  LIST_TOP_SCORES_QUERY,
  MAX_LIMIT,
  SCOREBOARD_CACHE_KEY,
  SCOREBOARD_CLIENT_ID_KEY,
  SCOREBOARD_PENDING_KEY,
  SCOREBOARD_PROFILE_IDENTITY_KEY,
  UPDATE_SCORE_MUTATION,
  UPSERT_PLAYER_PROFILE_MUTATION,
} from "./constants";
import type {
  RecordScoreInput,
  RemotePlayerProfile,
  RemoteScore,
  RemoteScoresResponse,
  ScoreEntry,
  ScoreSource,
  StoredScoreIdentity,
  StoredScore,
  TopScoresResult,
  UpsertPlayerProfileInput,
} from "./types";
import { resolveStorage, scoreSorter } from "./utils";

class ScoreClient {
  private readonly gateway: ConvexGateway;
  private readonly storage: Storage;
  private readonly clientId: string;

  constructor(gateway: ConvexGateway, storage?: Storage) {
    this.gateway = gateway;
    this.storage = resolveStorage(storage);
    this.clientId = this.getOrCreateClientId();
  }

  async upsertPlayerProfile(
    input: UpsertPlayerProfileInput,
  ): Promise<RemotePlayerProfile> {
    this.assertRemoteIdentityAvailable();

    const currentRecord = this.getCurrentClientStoredScore();
    const identity = this.readProfileIdentity();
    const clientRecordId =
      identity?.clientRecordId ??
      currentRecord?.localId ??
      this.createLocalId(input.score > 0 ? Date.now() : undefined);

    const response = await this.gateway.mutation<unknown>(
      UPSERT_PLAYER_PROFILE_MUTATION,
      {
        clientId: this.clientId,
        clientRecordId,
        nick: this.normalizeNick(input.nick),
        score: this.normalizeScore(input.score),
        streak: this.normalizeStreak(input.streak ?? 0),
        difficulty: input.difficulty,
        keyboardPreference: input.keyboardPreference,
      },
    );

    const profile = this.parseRemotePlayerProfile(response, {
      clientId: this.clientId,
      clientRecordId,
      nick: input.nick,
      score: input.score,
      streak: input.streak ?? 0,
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
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: Date.now(),
      playerCode: this.normalizeRecoveryCode(code),
    });
  }

  adoptRecoveredIdentity(profile: RemotePlayerProfile): void {
    this.writeProfileIdentity({ clientRecordId: profile.clientRecordId });
    this.replaceCurrentBrowserScores(profile);
  }

  async recordScore(
    input: RecordScoreInput,
    mutation: string = ADD_SCORE_MUTATION,
  ): Promise<void> {
    const currentRecord = this.getCurrentClientStoredScore();
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
      score,
      streak,
      createdAt,
    };

    this.addToCache(record, overwriteExisting);

    if (!this.gateway.isConfigured || !this.isOnline()) {
      this.addToPending(record, overwriteExisting, mutation);
      return;
    }

    try {
      await this.gateway.mutation(mutation, {
        clientRecordId: identity?.clientRecordId ?? record.localId,
        clientId: this.clientId,
        nick: record.nick,
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

  async listTopScores(limit = DEFAULT_LIMIT): Promise<TopScoresResult> {
    const safeLimit = this.normalizeLimit(limit);
    const identity = this.readProfileIdentity();

    if (!this.gateway.isConfigured || !this.isOnline()) {
      const localScores = this.localScoresRanked();
      const localResult = this.buildTopScoresResult(localScores, safeLimit);
      return {
        scores: localResult.scores,
        source: "local",
        currentClientRank: localResult.currentClientRank,
        currentClientEntry: localResult.currentClientEntry,
      };
    }

    await this.syncPendingScores();

    try {
      const remoteResponse = await this.gateway.query<
        RemoteScoresResponse | RemoteScore[]
      >(LIST_TOP_SCORES_QUERY, {
        limit: safeLimit,
        clientId: this.clientId,
        clientRecordId: identity?.clientRecordId,
      });
      const parsedResponse = this.parseRemoteScoresResponse(remoteResponse);
      const mergedScores = this.mergeRemoteAndPending(
        parsedResponse.scores,
        safeLimit,
      );
      const currentClientEntry =
        parsedResponse.currentClientEntry !== null
          ? this.toScoreEntry(parsedResponse.currentClientEntry, "convex")
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

      const localScores = this.localScoresRanked();
      const localResult = this.buildTopScoresResult(localScores, safeLimit);
      return {
        scores: localResult.scores,
        source: "local",
        currentClientRank: localResult.currentClientRank,
        currentClientEntry: localResult.currentClientEntry,
      };
    }
  }

  private async syncPendingScores(): Promise<void> {
    const pending = this.dedupeStoredByNick(
      this.readScores(SCOREBOARD_PENDING_KEY),
    );

    if (
      pending.length === 0 ||
      !this.gateway.isConfigured ||
      !this.isOnline()
    ) {
      return;
    }

    const stillPending: StoredScore[] = [];
    let networkDown = false;

    for (const entry of pending) {
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
  }

  private localScoresRanked(): ScoreEntry[] {
    return this.dedupeStoredByLocalId(
      this.dedupeStoredByNick(this.readScores(SCOREBOARD_CACHE_KEY)),
    )
      .sort(scoreSorter)
      .map((entry) => this.toLocalScoreEntry(entry));
  }

  private mergeRemoteAndPending(
    remoteScores: RemoteScore[],
    limit: number,
  ): ScoreEntry[] {
    const pending = this.dedupeStoredByNick(
      this.readScores(SCOREBOARD_PENDING_KEY),
    );

    const remoteEntries: ScoreEntry[] = remoteScores.map((entry) =>
      this.toScoreEntry(entry, "convex"),
    );

    const pendingEntries: ScoreEntry[] = pending.map((entry) =>
      this.toLocalScoreEntry(entry),
    );

    return this.dedupeCurrentClientEntries(
      this.dedupeScoreEntriesByNick([...remoteEntries, ...pendingEntries]),
    )
      .sort((a, b) => scoreSorter(a, b))
      .slice(0, limit);
  }

  private toLocalScoreEntry(entry: StoredScore): ScoreEntry {
    return {
      id: entry.localId,
      nick: entry.nick,
      score: entry.score,
      streak: entry.streak,
      createdAt: entry.createdAt,
      source: "local",
      isCurrentClient: !entry.clientId || entry.clientId === this.clientId,
    };
  }

  private toScoreEntry(
    entry: Pick<RemoteScore, "id" | "nick" | "score" | "createdAt"> &
      Partial<Pick<RemoteScore, "isCurrentClient" | "streak">>,
    source: ScoreSource,
  ): ScoreEntry {
    return {
      id: entry.id,
      nick: entry.nick,
      score: entry.score,
      streak: this.normalizeStreak(entry.streak ?? 0),
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
    const sameNick = this.nickKey(stored.nick) === this.nickKey(nextEntry.nick);
    const sameClient =
      Boolean(nextEntry.clientId) && stored.clientId === nextEntry.clientId;
    const sameLocalId = stored.localId === nextEntry.localId;

    return sameNick || sameClient || sameLocalId;
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
      const key = this.nickKey(entry.nick);
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

  private getCurrentClientStoredScore(): StoredScore | null {
    const identity = this.readProfileIdentity();
    const entries = [
      ...this.readScores(SCOREBOARD_CACHE_KEY),
      ...this.readScores(SCOREBOARD_PENDING_KEY),
    ].filter(
      (entry) =>
        entry.clientId === this.clientId ||
        (identity !== null && entry.localId === identity.clientRecordId),
    );

    let current: StoredScore | null = null;

    for (const entry of entries) {
      if (!current || scoreSorter(entry, current) < 0) {
        current = entry;
      }
    }

    return current;
  }

  private dedupeScoreEntriesByNick(entries: ScoreEntry[]): ScoreEntry[] {
    const byNick = new Map<string, ScoreEntry>();

    for (const entry of entries) {
      const key = this.nickKey(entry.nick);
      const current = byNick.get(key);

      if (!current || scoreSorter(entry, current) < 0) {
        byNick.set(key, entry);
        continue;
      }

      if (
        scoreSorter(entry, current) === 0 &&
        entry.isCurrentClient &&
        (!current.isCurrentClient ||
          (entry.source === "local" && current.source !== "local"))
      ) {
        byNick.set(key, entry);
        continue;
      }

      if (
        scoreSorter(entry, current) === 0 &&
        entry.source === "convex" &&
        current.source !== "convex"
      ) {
        byNick.set(key, entry);
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

    return entries.filter(
      (entry) => !entry.isCurrentClient || entry === preferred,
    );
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
      score: this.normalizeScore(
        typeof candidate.score === "number" ? candidate.score : fallback.score,
      ),
      streak: this.normalizeStreak(
        typeof candidate.streak === "number"
          ? candidate.streak
          : fallback.streak,
      ),
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
      createdAt:
        typeof candidate.createdAt === "number" &&
        Number.isFinite(candidate.createdAt)
          ? candidate.createdAt
          : fallback.createdAt,
    };
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

  private replaceCurrentBrowserScores(profile: RemotePlayerProfile): void {
    const nextEntry: StoredScore = {
      localId: profile.clientRecordId,
      clientId: this.clientId,
      nick: profile.nick,
      score: profile.score,
      streak: profile.streak,
      createdAt: profile.createdAt,
    };

    const cache = [
      ...this.readScores(SCOREBOARD_CACHE_KEY).filter(
        (entry) => !this.isCurrentBrowserEntry(entry),
      ),
      nextEntry,
    ];
    const pending = this.readScores(SCOREBOARD_PENDING_KEY).filter(
      (entry) => !this.isCurrentBrowserEntry(entry),
    );

    this.writeScores(SCOREBOARD_CACHE_KEY, this.dedupeStoredByNick(cache));
    this.writeScores(SCOREBOARD_PENDING_KEY, pending);
  }

  private isCurrentBrowserEntry(entry: StoredScore): boolean {
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
