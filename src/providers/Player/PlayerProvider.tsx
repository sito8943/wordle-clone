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
  clearAllPersistedGameStates,
  getRoundDurationMs,
  isScoreCommitDurationSuspicious,
  resolveEnabledDifficulty,
  type Player,
  type PlayerDifficulty,
  type PlayerKeyboardPreference,
  type PlayerLanguage,
  type RoundSyncEvent,
} from "@domain/wordle";
import { useFeatureFlags } from "@providers/FeatureFlags";

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

  const applyRemoteProfile = useCallback(
    async (
      remoteProfile: {
        nick: string;
        playerCode: string;
        score: number;
        streak: number;
        language: PlayerLanguage;
        difficulty: PlayerDifficulty;
        keyboardPreference: PlayerKeyboardPreference;
      },
      options?: { preserveLocalPreferences?: boolean },
    ) => {
      const preserveLocalPreferences =
        options?.preserveLocalPreferences === true;
      let shouldInvalidateTopScores = false;

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
          score: remoteProfile.score,
          streak: remoteProfile.streak,
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
        await syncQueuedRoundEvents(current);
        return;
      }

      const remoteProfile = await scoreClient.upsertPlayerProfile({
        nick: normalizedName,
        language: current.language,
        difficulty: current.difficulty,
        keyboardPreference: current.keyboardPreference,
      });

      await applyRemoteProfile(remoteProfile);
      await syncQueuedRoundEvents({
        ...current,
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
        language: remoteProfile.language,
      });
    },
    [applyRemoteProfile, scoreClient, storedPlayer, syncQueuedRoundEvents],
  );

  const recoverPlayer = useCallback(
    async (code: string) => {
      const remoteProfile = await scoreClient.recoverPlayerByCode(code);
      scoreClient.adoptRecoveredIdentity(remoteProfile);
      await applyRemoteProfile(remoteProfile);
    },
    [applyRemoteProfile, scoreClient],
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
  }, [applyRemoteProfile, player.language, scoreClient]);

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
    async (points: number, wonAt = Date.now(), roundStartedAt?: number) => {
      const safePoints =
        Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;

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
        streak: current.streak + 1,
      });

      setStoredPlayer(nextPlayer);
      scoreClient.cachePlayerScore({
        nick: nextPlayer.name,
        language: nextPlayer.language,
        score: nextPlayer.score,
        streak: nextPlayer.streak,
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

  const commitLoss = useCallback(async () => {
    const current = normalizePlayer(storedPlayer);

    if (current.hackingBan !== null) {
      return;
    }

    if (current.streak === 0) {
      return;
    }

    const nextPlayer = { ...current, streak: 0 };
    setStoredPlayer(nextPlayer);
    scoreClient.cachePlayerScore({
      nick: nextPlayer.name,
      language: nextPlayer.language,
      score: nextPlayer.score,
      streak: nextPlayer.streak,
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
      happenedAt: Date.now(),
      version: 2,
    });

    await syncQueuedRoundEvents(nextPlayer);
  }, [scoreClient, setStoredPlayer, storedPlayer, syncQueuedRoundEvents]);

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
          return;
        }

        const remoteProfile = await scoreClient.getCurrentPlayerProfile(
          player.language,
        );
        if (remoteProfile) {
          await applyRemoteProfile(remoteProfile, {
            preserveLocalPreferences: true,
          });
        }
      })
      .catch(() => undefined);
  }, [
    applyRemoteProfile,
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
