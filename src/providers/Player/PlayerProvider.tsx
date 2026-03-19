import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, useLocalStorage } from "@hooks";
import { PlayerContext } from "./PlayerContext";
import { DEFAULT_PLAYER } from "./constants";
import type { ProviderProps } from "../types";
import { useApi } from "../Api";
import { normalizePlayer, normalizePlayerName } from "./utils";
import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  VictorySyncEvent,
} from "@domain/wordle";

const PlayerProvider = ({ children }: ProviderProps) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();

  const [storedPlayer, setStoredPlayer] = useLocalStorage<Player>(
    "player",
    DEFAULT_PLAYER,
  );
  const player = useMemo(() => normalizePlayer(storedPlayer), [storedPlayer]);
  const didHydrateRemoteRef = useRef(false);
  const previousPreferencesRef = useRef({
    difficulty: player.difficulty,
    keyboardPreference: player.keyboardPreference,
  });

  const applyRemoteProfile = useCallback(
    async (remoteProfile: {
      nick: string;
      playerCode: string;
      score: number;
      streak: number;
      difficulty: PlayerDifficulty;
      keyboardPreference: PlayerKeyboardPreference;
    }) => {
      setStoredPlayer((previous) => ({
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
        score: remoteProfile.score,
        streak: remoteProfile.streak,
        difficulty: remoteProfile.difficulty,
        keyboardPreference: remoteProfile.keyboardPreference,
        showEndOfGameDialogs: normalizePlayer(previous).showEndOfGameDialogs,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.topScores });
    },
    [queryClient, setStoredPlayer],
  );

  useEffect(() => {
    setStoredPlayer((previous) => {
      const normalized = normalizePlayer(previous);
      if (
        previous.name === normalized.name &&
        previous.code === normalized.code &&
        previous.score === normalized.score &&
        previous.streak === normalized.streak &&
        previous.difficulty === normalized.difficulty &&
        previous.keyboardPreference === normalized.keyboardPreference &&
        previous.showEndOfGameDialogs === normalized.showEndOfGameDialogs
      ) {
        return previous;
      }

      return normalized;
    });
  }, [setStoredPlayer]);

  const syncQueuedVictories = useCallback(
    async (currentPlayer: Player) => {
      const syncedProfile = await scoreClient.syncVictoryEvents({
        nick: currentPlayer.name,
        difficulty: currentPlayer.difficulty,
        keyboardPreference: currentPlayer.keyboardPreference,
      });

      if (syncedProfile) {
        await applyRemoteProfile(syncedProfile);
      }
    },
    [applyRemoteProfile, scoreClient],
  );

  const updatePlayer = useCallback(
    async (name: string) => {
      const normalizedName = normalizePlayerName(name);
      const current = normalizePlayer(storedPlayer);

      if (normalizedName === current.name && current.code.length > 0) {
        await syncQueuedVictories(current);
        return;
      }

      const remoteProfile = await scoreClient.upsertPlayerProfile({
        nick: normalizedName,
        score: current.score,
        streak: current.streak,
        difficulty: current.difficulty,
        keyboardPreference: current.keyboardPreference,
      });

      await applyRemoteProfile(remoteProfile);
      await syncQueuedVictories({
        ...current,
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
      });
    },
    [applyRemoteProfile, scoreClient, storedPlayer, syncQueuedVictories],
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
    const remoteProfile = await scoreClient.getCurrentPlayerProfile();

    if (!remoteProfile) {
      return;
    }

    await applyRemoteProfile(remoteProfile);
  }, [applyRemoteProfile, scoreClient]);

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
    async (points: number, wonAt = Date.now()) => {
      const safePoints =
        Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;

      if (safePoints === 0) {
        return;
      }

      const current = normalizePlayer(storedPlayer);
      const nextPlayer = normalizePlayer({
        ...current,
        score: current.score + safePoints,
        streak: current.streak + 1,
      });

      setStoredPlayer(nextPlayer);
      scoreClient.cachePlayerScore({
        nick: nextPlayer.name,
        score: nextPlayer.score,
        streak: nextPlayer.streak,
        createdAt: wonAt,
        overwriteExisting: true,
      });

      const event: VictorySyncEvent = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${wonAt}-${Math.random().toString(36).slice(2)}`,
        playerId: current.code || current.name,
        score: nextPlayer.score,
        streak: nextPlayer.streak,
        wonAt,
        version: 1,
      };

      scoreClient.queueVictoryEvent(event);

      if (current.name === DEFAULT_PLAYER.name) {
        return;
      }

      await syncQueuedVictories(nextPlayer);
    },
    [scoreClient, setStoredPlayer, storedPlayer, syncQueuedVictories],
  );

  const commitLoss = useCallback(async () => {
    const current = normalizePlayer(storedPlayer);

    if (current.streak === 0) {
      return;
    }

    const nextPlayer = { ...current, streak: 0 };
    setStoredPlayer(nextPlayer);
    scoreClient.cachePlayerScore({
      nick: nextPlayer.name,
      score: nextPlayer.score,
      streak: nextPlayer.streak,
      overwriteExisting: true,
    });
  }, [scoreClient, setStoredPlayer, storedPlayer]);

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

  const contextValue = useMemo(
    () => ({
      player,
      updatePlayer,
      recoverPlayer,
      refreshCurrentPlayerProfile,
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      updatePlayerShowEndOfGameDialogs,
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
      updatePlayerShowEndOfGameDialogs,
      commitVictory,
      commitLoss,
    ],
  );

  useEffect(() => {
    if (player.name === DEFAULT_PLAYER.name) {
      previousPreferencesRef.current = {
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      };
      return;
    }

    if (didHydrateRemoteRef.current) {
      return;
    }

    didHydrateRemoteRef.current = true;

    void syncQueuedVictories(player)
      .then(async () => {
        const remoteProfile = await scoreClient.getCurrentPlayerProfile();
        if (remoteProfile) {
          await applyRemoteProfile(remoteProfile);
        }
      })
      .catch(() => undefined);
  }, [
    applyRemoteProfile,
    player,
    player.name,
    scoreClient,
    syncQueuedVictories,
  ]);

  useEffect(() => {
    const previous = previousPreferencesRef.current;
    const difficultyChanged = player.difficulty !== previous.difficulty;
    const keyboardPreferenceChanged =
      player.keyboardPreference !== previous.keyboardPreference;

    previousPreferencesRef.current = {
      difficulty: player.difficulty,
      keyboardPreference: player.keyboardPreference,
    };

    if (
      player.name === DEFAULT_PLAYER.name ||
      (!difficultyChanged && !keyboardPreferenceChanged)
    ) {
      return;
    }

    void scoreClient
      .upsertPlayerProfile({
        nick: player.name,
        score: player.score,
        streak: player.streak,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      })
      .then((remoteProfile) => applyRemoteProfile(remoteProfile))
      .catch(() => undefined);
  }, [applyRemoteProfile, player, scoreClient]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerProvider };
