import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useLocalStorage } from "@hooks";
import { i18n } from "@i18n";
import { PlayerContext } from "./PlayerContext";
import { DEFAULT_PLAYER } from "./constants";
import type { ProviderProps } from "../types";
import { useApi } from "../Api";
import {
  arePlayersEqual,
  isStoredPlayerNormalized,
  normalizePlayer,
  normalizePlayerName,
  resolveInitialPlayer,
  toSafeTimestamp,
} from "./utils";
import {
  MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS,
  SCOREBOARD_MODE_IDS,
  clearAllPersistedGameStates,
  getRoundDurationMs,
  isScoreCommitDurationSuspicious,
  resolveScoreboardModeId,
  resolveEnabledDifficulty,
  writeDailyModeOutcomeForDate,
  type Player,
  type PlayerDifficulty,
  type PlayerKeyboardPreference,
  type PlayerLanguage,
  type RoundSyncEvent,
  type ScoreboardModeId,
} from "@domain/wordle";
import { useFeatureFlags } from "@providers/FeatureFlags";
import type { RemotePlayerProfile } from "@api/score";

const PlayerProvider = ({ children }: ProviderProps) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();
  const {
    difficultyEasyEnabled,
    difficultyNormalEnabled,
    difficultyHardEnabled,
    difficultyInsaneEnabled,
  } = useFeatureFlags();

  const [storedPlayer, setStoredPlayer] = useLocalStorage<Player>(
    "player",
    resolveInitialPlayer,
  );
  const player = useMemo(() => normalizePlayer(storedPlayer), [storedPlayer]);
  const didHydrateRemoteRef = useRef(false);
  const previousPreferencesRef = useRef({
    language: player.language,
    difficulty: player.difficulty,
    keyboardPreference: player.keyboardPreference,
  });

  const hydrateDailyModeOutcomeFromProfile = useCallback(
    (
      remoteProfile: Pick<
        RemotePlayerProfile,
        "playerCode" | "hasWonDailyToday"
      >,
    ) => {
      if (
        remoteProfile.playerCode.trim().length === 0 ||
        remoteProfile.hasWonDailyToday !== true
      ) {
        return;
      }

      writeDailyModeOutcomeForDate({
        outcome: "won",
        playerCode: remoteProfile.playerCode,
      });
    },
    [],
  );

  const applyRemoteProfile = useCallback(
    async (
      remoteProfile: RemotePlayerProfile,
      options?: {
        preserveLocalPreferences?: boolean;
        preserveLocalProgress?: boolean;
      },
    ) => {
      const preserveLocalPreferences =
        options?.preserveLocalPreferences === true;
      const preserveLocalProgress = options?.preserveLocalProgress === true;
      let shouldInvalidateTopScores = false;
      const classicProgress = remoteProfile.progressByMode?.classic;
      const resolvedRemoteScore = classicProgress?.score ?? remoteProfile.score;
      const resolvedRemoteStreak =
        classicProgress?.streak ?? remoteProfile.streak;

      setStoredPlayer((previous) => {
        const normalizedPrevious = normalizePlayer(previous);
        const language = preserveLocalPreferences
          ? normalizedPrevious.language
          : remoteProfile.language;
        const difficulty = preserveLocalPreferences
          ? normalizedPrevious.difficulty
          : remoteProfile.difficulty;
        const keyboardPreference = preserveLocalPreferences
          ? normalizedPrevious.keyboardPreference
          : remoteProfile.keyboardPreference;
        const nextPlayer = {
          name: remoteProfile.nick,
          code: remoteProfile.playerCode,
          score: preserveLocalProgress
            ? normalizedPrevious.score
            : resolvedRemoteScore,
          streak: preserveLocalProgress
            ? normalizedPrevious.streak
            : resolvedRemoteStreak,
          language,
          difficulty,
          keyboardPreference,
          declinedTutorial: normalizedPrevious.declinedTutorial,
          showEndOfGameDialogs: normalizedPrevious.showEndOfGameDialogs,
          manualTileSelection: normalizedPrevious.manualTileSelection,
          hackingBan: normalizedPrevious.hackingBan,
        };

        previousPreferencesRef.current = {
          language: nextPlayer.language,
          difficulty: nextPlayer.difficulty,
          keyboardPreference: nextPlayer.keyboardPreference,
        };
        shouldInvalidateTopScores =
          normalizedPrevious.name !== nextPlayer.name ||
          normalizedPrevious.code !== nextPlayer.code ||
          normalizedPrevious.score !== nextPlayer.score ||
          normalizedPrevious.streak !== nextPlayer.streak;

        return arePlayersEqual(normalizedPrevious, nextPlayer)
          ? previous
          : nextPlayer;
      });

      if (!shouldInvalidateTopScores) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.topScores });
    },
    [queryClient, setStoredPlayer],
  );

  useEffect(() => {
    setStoredPlayer((previous) => {
      if (isStoredPlayerNormalized(previous)) {
        return previous;
      }

      return normalizePlayer(previous);
    });
  }, [setStoredPlayer]);

  const difficultyMigrationRef = useRef(false);
  useEffect(() => {
    if (difficultyMigrationRef.current) {
      return;
    }
    difficultyMigrationRef.current = true;

    const resolved = resolveEnabledDifficulty(player.difficulty, {
      easy: difficultyEasyEnabled,
      normal: difficultyNormalEnabled,
      hard: difficultyHardEnabled,
      insane: difficultyInsaneEnabled,
    });

    if (!resolved || resolved === player.difficulty) {
      return;
    }

    clearAllPersistedGameStates();
    setStoredPlayer((previous) => ({
      ...normalizePlayer(previous),
      difficulty: resolved,
    }));
  }, [
    difficultyEasyEnabled,
    difficultyHardEnabled,
    difficultyInsaneEnabled,
    difficultyNormalEnabled,
    player.difficulty,
    setStoredPlayer,
  ]);

  const syncQueuedRoundEvents = useCallback(
    async (currentPlayer: Player) => {
      if (currentPlayer.hackingBan !== null) {
        return null;
      }

      const syncedProfile = await scoreClient.syncRoundEvents({
        nick: currentPlayer.name,
        language: currentPlayer.language,
        difficulty: currentPlayer.difficulty,
        keyboardPreference: currentPlayer.keyboardPreference,
      });

      if (syncedProfile) {
        await applyRemoteProfile(syncedProfile, {
          preserveLocalPreferences: true,
          preserveLocalProgress: true,
        });
      }

      return syncedProfile;
    },
    [applyRemoteProfile, scoreClient],
  );

  const updatePlayer = useCallback(
    async (name: string) => {
      const normalizedName = normalizePlayerName(name);
      const current = normalizePlayer(storedPlayer);

      if (normalizedName === current.name && current.code.length > 0) {
        const syncedProfile = await syncQueuedRoundEvents(current);
        if (syncedProfile) {
          hydrateDailyModeOutcomeFromProfile(syncedProfile);
        }
        return;
      }

      const remoteProfile = await scoreClient.upsertPlayerProfile({
        nick: normalizedName,
        language: current.language,
        difficulty: current.difficulty,
        keyboardPreference: current.keyboardPreference,
      });

      await applyRemoteProfile(remoteProfile);
      hydrateDailyModeOutcomeFromProfile(remoteProfile);
      const syncedProfile = await syncQueuedRoundEvents({
        ...current,
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
        language: remoteProfile.language,
      });
      if (syncedProfile) {
        hydrateDailyModeOutcomeFromProfile(syncedProfile);
      }
    },
    [
      applyRemoteProfile,
      hydrateDailyModeOutcomeFromProfile,
      scoreClient,
      storedPlayer,
      syncQueuedRoundEvents,
    ],
  );

  const recoverPlayer = useCallback(
    async (code: string) => {
      const remoteProfile = await scoreClient.recoverPlayerByCode(code);
      scoreClient.adoptRecoveredIdentity(remoteProfile);
      await applyRemoteProfile(remoteProfile);
      hydrateDailyModeOutcomeFromProfile(remoteProfile);
    },
    [applyRemoteProfile, hydrateDailyModeOutcomeFromProfile, scoreClient],
  );

  const refreshCurrentPlayerProfile = useCallback(async () => {
    const remoteProfile = await scoreClient.getCurrentPlayerProfile(
      player.language,
    );

    if (!remoteProfile) {
      return;
    }

    await applyRemoteProfile(remoteProfile, {
      preserveLocalPreferences: true,
    });
    hydrateDailyModeOutcomeFromProfile(remoteProfile);
  }, [
    applyRemoteProfile,
    hydrateDailyModeOutcomeFromProfile,
    player.language,
    scoreClient,
  ]);

  const replacePlayer = useCallback(
    (nextPlayer: Partial<Player>) => {
      setStoredPlayer((prev) =>
        normalizePlayer({
          ...normalizePlayer(prev),
          ...nextPlayer,
        }),
      );
    },
    [setStoredPlayer],
  );

  const commitVictory = useCallback(
    async (
      points: number,
      wonAt = Date.now(),
      roundStartedAt?: number,
      modeId?: ScoreboardModeId,
    ) => {
      const safePoints =
        Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;
      const safeModeId = resolveScoreboardModeId(modeId);

      if (safePoints === 0) {
        return;
      }

      const now = Date.now();
      const safeWonAt = toSafeTimestamp(wonAt) ?? now;
      const safeRoundStartedAt = toSafeTimestamp(roundStartedAt);
      const current = normalizePlayer(storedPlayer);
      if (current.hackingBan !== null) {
        return;
      }
      if (safeRoundStartedAt !== null) {
        const roundDurationMs = getRoundDurationMs(
          safeRoundStartedAt,
          safeWonAt,
        );

        if (
          roundDurationMs !== null &&
          isScoreCommitDurationSuspicious(roundDurationMs)
        ) {
          setStoredPlayer(
            normalizePlayer({
              ...current,
              hackingBan: {
                reason: "score-submission-too-fast",
                bannedAt: safeWonAt,
                thresholdMs: MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS,
                detectedRoundDurationMs: roundDurationMs,
              },
            }),
          );
          return;
        }
      }

      const nextPlayer = normalizePlayer({
        ...current,
        score: current.score + safePoints,
        streak:
          safeModeId === SCOREBOARD_MODE_IDS.CLASSIC
            ? current.streak + 1
            : current.streak,
      });
      const currentModeScore = scoreClient.getCurrentClientScoreSnapshot(
        current.language,
        safeModeId,
      );

      setStoredPlayer(nextPlayer);
      scoreClient.cachePlayerScore({
        nick: nextPlayer.name,
        language: nextPlayer.language,
        modeId: safeModeId,
        score: currentModeScore.score + safePoints,
        streak: currentModeScore.streak + 1,
        createdAt: safeWonAt,
        overwriteExisting: true,
      });

      const event: RoundSyncEvent = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${safeWonAt}-${Math.random().toString(36).slice(2)}`,
        kind: "win",
        pointsDelta: safePoints,
        modeId: safeModeId,
        happenedAt: safeWonAt,
        version: 2,
      };

      scoreClient.queueRoundEvent(event);

      if (current.name === DEFAULT_PLAYER.name) {
        return;
      }

      await syncQueuedRoundEvents(nextPlayer);
    },
    [scoreClient, setStoredPlayer, storedPlayer, syncQueuedRoundEvents],
  );

  const commitLoss = useCallback(
    async (modeId?: ScoreboardModeId) => {
      const safeModeId = resolveScoreboardModeId(modeId);
      const current = normalizePlayer(storedPlayer);
      const currentModeScore = scoreClient.getCurrentClientScoreSnapshot(
        current.language,
        safeModeId,
      );
      const shouldResetDefaultModeStreak =
        safeModeId === SCOREBOARD_MODE_IDS.CLASSIC && current.streak > 0;

      if (current.hackingBan !== null) {
        return;
      }

      if (!shouldResetDefaultModeStreak && currentModeScore.streak === 0) {
        return;
      }

      const nextPlayer = shouldResetDefaultModeStreak
        ? { ...current, streak: 0 }
        : current;
      setStoredPlayer(nextPlayer);
      scoreClient.cachePlayerScore({
        nick: nextPlayer.name,
        language: nextPlayer.language,
        modeId: safeModeId,
        score: currentModeScore.score,
        streak: 0,
        overwriteExisting: true,
      });

      if (current.name === DEFAULT_PLAYER.name) {
        return;
      }

      scoreClient.queueRoundEvent({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind: "loss",
        modeId: safeModeId,
        happenedAt: Date.now(),
        version: 2,
      });

      await syncQueuedRoundEvents(nextPlayer);
    },
    [scoreClient, setStoredPlayer, storedPlayer, syncQueuedRoundEvents],
  );

  const updatePlayerDifficulty = useCallback(
    (difficulty: PlayerDifficulty) => {
      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        if (normalized.difficulty === difficulty) {
          if (prev.difficulty === difficulty) {
            return prev;
          }

          return normalized;
        }

        return { ...normalized, difficulty };
      });
    },
    [setStoredPlayer],
  );

  const updatePlayerKeyboardPreference = useCallback(
    (preference: PlayerKeyboardPreference) => {
      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        if (normalized.keyboardPreference === preference) {
          if (prev.keyboardPreference === preference) {
            return prev;
          }

          return normalized;
        }

        return { ...normalized, keyboardPreference: preference };
      });
    },
    [setStoredPlayer],
  );

  const updatePlayerLanguage = useCallback(
    (language: PlayerLanguage) => {
      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        if (normalized.language === language) {
          if (prev.language === language) {
            return prev;
          }

          return normalized;
        }

        return { ...normalized, language };
      });
    },
    [setStoredPlayer],
  );

  const updatePlayerShowEndOfGameDialogs = useCallback(
    (showDialogs: boolean) => {
      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        if (normalized.showEndOfGameDialogs === showDialogs) {
          if (prev.showEndOfGameDialogs === showDialogs) {
            return prev;
          }

          return normalized;
        }

        return { ...normalized, showEndOfGameDialogs: showDialogs };
      });
    },
    [setStoredPlayer],
  );

  const updatePlayerManualTileSelection = useCallback(
    (enabled: boolean) => {
      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        if (normalized.manualTileSelection === enabled) {
          if (prev.manualTileSelection === enabled) {
            return prev;
          }

          return normalized;
        }

        return { ...normalized, manualTileSelection: enabled };
      });
    },
    [setStoredPlayer],
  );

  const contextValue = useMemo(
    () => ({
      player,
      updatePlayer,
      recoverPlayer,
      refreshCurrentPlayerProfile,
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      updatePlayerLanguage,
      updatePlayerShowEndOfGameDialogs,
      updatePlayerManualTileSelection,
      commitVictory,
      commitLoss,
    }),
    [
      player,
      updatePlayer,
      recoverPlayer,
      refreshCurrentPlayerProfile,
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      updatePlayerLanguage,
      updatePlayerShowEndOfGameDialogs,
      updatePlayerManualTileSelection,
      commitVictory,
      commitLoss,
    ],
  );

  useEffect(() => {
    if (player.name === DEFAULT_PLAYER.name) {
      previousPreferencesRef.current = {
        language: player.language,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      };
      return;
    }

    if (didHydrateRemoteRef.current) {
      return;
    }

    didHydrateRemoteRef.current = true;

    void syncQueuedRoundEvents(player)
      .then(async (syncedProfile) => {
        if (syncedProfile) {
          hydrateDailyModeOutcomeFromProfile(syncedProfile);
          return;
        }

        const remoteProfile = await scoreClient.getCurrentPlayerProfile(
          player.language,
        );
        if (remoteProfile) {
          await applyRemoteProfile(remoteProfile, {
            preserveLocalPreferences: true,
          });
          hydrateDailyModeOutcomeFromProfile(remoteProfile);
        }
      })
      .catch(() => undefined);
  }, [
    applyRemoteProfile,
    hydrateDailyModeOutcomeFromProfile,
    player,
    player.name,
    scoreClient,
    syncQueuedRoundEvents,
  ]);

  useEffect(() => {
    const previous = previousPreferencesRef.current;
    const languageChanged = player.language !== previous.language;
    const difficultyChanged = player.difficulty !== previous.difficulty;
    const keyboardPreferenceChanged =
      player.keyboardPreference !== previous.keyboardPreference;

    previousPreferencesRef.current = {
      language: player.language,
      difficulty: player.difficulty,
      keyboardPreference: player.keyboardPreference,
    };

    if (
      player.name === DEFAULT_PLAYER.name ||
      (!languageChanged && !difficultyChanged && !keyboardPreferenceChanged)
    ) {
      return;
    }

    void scoreClient
      .upsertPlayerProfile({
        nick: player.name,
        language: player.language,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      })
      .then((remoteProfile) =>
        applyRemoteProfile(remoteProfile, {
          preserveLocalPreferences: true,
        }),
      )
      .catch(() => undefined);
  }, [applyRemoteProfile, player, scoreClient]);

  useEffect(() => {
    if (i18n.language === player.language) {
      return;
    }

    void i18n.changeLanguage(player.language).catch(() => undefined);
  }, [player.language]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerProvider };
