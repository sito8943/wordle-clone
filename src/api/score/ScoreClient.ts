import {
  SCOREBOARD_CACHE_KEY,
  SCOREBOARD_CLIENT_ID_KEY,
  SCOREBOARD_PROFILE_IDENTITY_KEY,
} from "./constants";
import { SCOREBOARD_MODE_IDS, resolveScoreboardModeId } from "@domain/wordle";
import type { PlayerLanguage, ScoreboardModeId } from "@domain/wordle";
import type {
  RecordScoreInput,
  RemoteModeProgress,
  RemotePlayerProfile,
  RemoteProgressByMode,
  StoredScore,
  StoredScoreIdentity,
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

  private readonly storage: Storage;
  private readonly clientId: string;

  constructor(storage?: Storage) {
    this.storage = resolveStorage(storage);
    this.clientId = this.getOrCreateClientId();
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

  adoptRecoveredIdentity(
    profile: RemotePlayerProfile,
    options?: {
      mergeCurrentBrowserProgress?: boolean;
    },
  ): void {
    const previousIdentity = this.readProfileIdentity();
    const preserveModeScopedEntries =
      previousIdentity?.clientRecordId === profile.clientRecordId;
    const mergeCurrentBrowserProgress =
      options?.mergeCurrentBrowserProgress !== false;

    this.writeProfileIdentity({ clientRecordId: profile.clientRecordId });
    this.replaceCurrentBrowserScores(
      profile,
      preserveModeScopedEntries,
      mergeCurrentBrowserProgress,
    );
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
      language: this.normalizeLanguage(candidate.language),
      modeId: this.normalizeModeId(candidate.modeId),
      score: this.normalizeScore(candidate.score),
      streak: this.normalizeStreak(candidate.streak ?? 0),
      createdAt: candidate.createdAt,
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

    return this.pickCurrentClientSnapshot(cacheEntries);
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
    mergeCurrentBrowserProgress: boolean,
  ): void {
    const cacheEntries = this.readScores(SCOREBOARD_CACHE_KEY);
    const localCurrentLanguageEntries = mergeCurrentBrowserProgress
      ? cacheEntries.filter(
          (entry) =>
            this.isCurrentBrowserEntryForAnyMode(entry) &&
            entry.language === profile.language,
        )
      : [];
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
    const cache = [
      ...cacheEntries.filter((entry) => !shouldDropCurrentEntry(entry)),
      ...preservedCacheEntries,
      ...nextEntries,
    ];

    this.writeScores(SCOREBOARD_CACHE_KEY, this.dedupeStoredByNick(cache));
  }

  private isCurrentBrowserEntryForAnyMode(entry: StoredScore): boolean {
    const identity = this.readProfileIdentity();

    return (
      entry.clientId === this.clientId ||
      entry.localId === identity?.clientRecordId
    );
  }
}

export { ScoreClient };
