import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UPDATE_SCORE_MUTATION } from "@api/score/constants";
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
} from "@domain/wordle";

const PlayerProvider = ({ children }: ProviderProps) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();

  const [storedPlayer, setStoredPlayer] = useLocalStorage<Player>(
    "player",
    DEFAULT_PLAYER,
  );
  const player = useMemo(() => normalizePlayer(storedPlayer), [storedPlayer]);

  const didMountRef = useRef(false);
  const previousSnapshotRef = useRef({
    name: player.name,
    code: player.code,
    score: player.score,
    streak: player.streak,
    difficulty: player.difficulty,
    keyboardPreference: player.keyboardPreference,
  });
  const skipNextScoreSyncRef = useRef(false);

  useEffect(() => {
    setStoredPlayer((previous) => {
      const normalized = normalizePlayer(previous);
      if (
        previous.name === normalized.name &&
        previous.code === normalized.code &&
        previous.score === normalized.score &&
        previous.streak === normalized.streak &&
        previous.difficulty === normalized.difficulty &&
        previous.keyboardPreference === normalized.keyboardPreference
      ) {
        return previous;
      }

      return normalized;
    });
  }, [setStoredPlayer]);

  const updatePlayer = useCallback(
    async (name: string) => {
      const normalizedName = normalizePlayerName(name);
      const current = normalizePlayer(storedPlayer);

      if (normalizedName === current.name && current.code.length > 0) {
        return;
      }

      const remoteProfile = await scoreClient.upsertPlayerProfile({
        nick: normalizedName,
        score: current.score,
        streak: current.streak,
        difficulty: current.difficulty,
        keyboardPreference: current.keyboardPreference,
      });

      skipNextScoreSyncRef.current = true;
      setStoredPlayer({
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
        score: remoteProfile.score,
        streak: remoteProfile.streak,
        difficulty: remoteProfile.difficulty,
        keyboardPreference: remoteProfile.keyboardPreference,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.topScores });
    },
    [queryClient, scoreClient, setStoredPlayer, storedPlayer],
  );

  const recoverPlayer = useCallback(
    async (code: string) => {
      const remoteProfile = await scoreClient.recoverPlayerByCode(code);
      scoreClient.adoptRecoveredIdentity(remoteProfile);
      skipNextScoreSyncRef.current = true;
      setStoredPlayer({
        name: remoteProfile.nick,
        code: remoteProfile.playerCode,
        score: remoteProfile.score,
        streak: remoteProfile.streak,
        difficulty: remoteProfile.difficulty,
        keyboardPreference: remoteProfile.keyboardPreference,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.topScores });
    },
    [queryClient, scoreClient, setStoredPlayer],
  );

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

  const increaseScore = useCallback(
    (points: number) => {
      const safePoints =
        Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;

      if (safePoints === 0) {
        return;
      }

      setStoredPlayer((prev) => {
        const normalized = normalizePlayer(prev);
        return { ...normalized, score: normalized.score + safePoints };
      });
    },
    [setStoredPlayer],
  );

  const increaseWinStreak = useCallback(() => {
    setStoredPlayer((prev) => {
      const normalized = normalizePlayer(prev);
      return { ...normalized, streak: normalized.streak + 1 };
    });
  }, [setStoredPlayer]);

  const resetWinStreak = useCallback(() => {
    setStoredPlayer((prev) => {
      const normalized = normalizePlayer(prev);
      if (normalized.streak === 0) {
        if (typeof prev.streak === "number" && prev.streak === 0) {
          return prev;
        }

        return normalized;
      }

      return { ...normalized, streak: 0 };
    });
  }, [setStoredPlayer]);

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

  const { name, score, streak } = player;
  const contextValue = useMemo(
    () => ({
      player,
      updatePlayer,
      recoverPlayer,
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      increaseScore,
      increaseWinStreak,
      resetWinStreak,
    }),
    [
      player,
      updatePlayer,
      recoverPlayer,
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      increaseScore,
      increaseWinStreak,
      resetWinStreak,
    ],
  );

  useEffect(() => {
    if (!didMountRef.current || name === DEFAULT_PLAYER.name) {
      return;
    }

    const previous = previousSnapshotRef.current;
    const difficultyChanged = player.difficulty !== previous.difficulty;
    const keyboardPreferenceChanged =
      player.keyboardPreference !== previous.keyboardPreference;

    if (!difficultyChanged && !keyboardPreferenceChanged) {
      return;
    }

    void scoreClient
      .upsertPlayerProfile({
        nick: name,
        score,
        streak,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      })
      .then((remoteProfile) => {
        setStoredPlayer((previousPlayer) => {
          const normalized = normalizePlayer(previousPlayer);
          if (
            normalized.code === remoteProfile.playerCode &&
            normalized.difficulty === remoteProfile.difficulty &&
            normalized.keyboardPreference === remoteProfile.keyboardPreference
          ) {
            return previousPlayer;
          }

          return {
            ...normalized,
            code: remoteProfile.playerCode,
            difficulty: remoteProfile.difficulty,
            keyboardPreference: remoteProfile.keyboardPreference,
          };
        });
      })
      .catch(() => undefined);
  }, [
    name,
    player.difficulty,
    player.keyboardPreference,
    score,
    scoreClient,
    setStoredPlayer,
    streak,
  ]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      previousSnapshotRef.current = {
        name,
        code: player.code,
        score,
        streak,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      };
      return;
    }

    if (skipNextScoreSyncRef.current) {
      skipNextScoreSyncRef.current = false;
      previousSnapshotRef.current = {
        name,
        code: player.code,
        score,
        streak,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      };
      return;
    }

    if (name === DEFAULT_PLAYER.name) {
      previousSnapshotRef.current = {
        name,
        code: player.code,
        score,
        streak,
        difficulty: player.difficulty,
        keyboardPreference: player.keyboardPreference,
      };
      return;
    }

    const previous = previousSnapshotRef.current;
    const nameChanged = name !== previous.name;
    const scoreChanged = score !== previous.score;
    const streakChanged = streak !== previous.streak;

    if (nameChanged) {
      void scoreClient.recordScore(
        {
          nick: name,
          score,
          streak,
          overwriteExisting: true,
        },
        UPDATE_SCORE_MUTATION,
      );
    } else if (scoreChanged || streakChanged) {
      void scoreClient.recordScore({ nick: name, score, streak });
    }

    previousSnapshotRef.current = {
      name,
      code: player.code,
      score,
      streak,
      difficulty: player.difficulty,
      keyboardPreference: player.keyboardPreference,
    };
  }, [
    name,
    player.code,
    player.difficulty,
    player.keyboardPreference,
    score,
    scoreClient,
    streak,
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerProvider };
