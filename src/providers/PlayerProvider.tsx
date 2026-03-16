import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "../hooks/";
import { PlayerContext } from "./PlayerContext";
import { DEFAULT_PLAYER } from "./constants";
import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  ProviderProps,
} from "./types";
import { useApi } from "./useApi";
import { normalizePlayer, normalizePlayerName } from "./utils";

const PlayerProvider = ({ children }: ProviderProps) => {
  const { scoreClient } = useApi();

  const [storedPlayer, setStoredPlayer] = useLocalStorage<Player>(
    "player",
    DEFAULT_PLAYER,
  );
  const player = useMemo(() => normalizePlayer(storedPlayer), [storedPlayer]);

  const didMountRef = useRef(false);
  const previousSnapshotRef = useRef({
    name: player.name,
    score: player.score,
    streak: player.streak,
  });

  useEffect(() => {
    setStoredPlayer((previous) => {
      const normalized = normalizePlayer(previous);
      if (
        previous.name === normalized.name &&
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
    (name: string) => {
      setStoredPlayer((prev) => ({
        ...normalizePlayer(prev),
        name: normalizePlayerName(name),
      }));
    },
    [setStoredPlayer],
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
      replacePlayer,
      updatePlayerDifficulty,
      updatePlayerKeyboardPreference,
      increaseScore,
      increaseWinStreak,
      resetWinStreak,
    ],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      previousSnapshotRef.current = { name, score, streak };
      return;
    }

    const previous = previousSnapshotRef.current;
    const nameChanged = name !== previous.name;
    const scoreChanged = score !== previous.score;
    const streakChanged = streak !== previous.streak;

    if (nameChanged || scoreChanged || streakChanged) {
      void scoreClient.recordScore({ nick: name, score, streak });
    }

    previousSnapshotRef.current = { name, score, streak };
  }, [name, score, streak, scoreClient]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerProvider };
