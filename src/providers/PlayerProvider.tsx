/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useLocalStorage } from "../hooks/";
import { useApi } from "./ApiProvider";
import { DEFAULT_PLAYER } from "./constants";
import type { Player, PlayerContextType, ProviderProps } from "./types";
import { normalizePlayer, normalizePlayerName } from "./utils";

const PlayerContext = createContext({} as PlayerContextType);

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
    if (
      storedPlayer.name !== player.name ||
      storedPlayer.score !== player.score ||
      storedPlayer.streak !== player.streak
    ) {
      setStoredPlayer({
        name: player.name,
        score: player.score,
        streak: player.streak,
      });
    }
  }, [
    player.name,
    player.score,
    player.streak,
    setStoredPlayer,
    storedPlayer.name,
    storedPlayer.score,
    storedPlayer.streak,
  ]);

  const updatePlayer = useCallback(
    (name: string) => {
      setStoredPlayer((prev) => ({
        ...normalizePlayer(prev),
        name: normalizePlayerName(name),
      }));
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

  const { name, score, streak } = player;

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
    <PlayerContext.Provider
      value={{
        player,
        updatePlayer,
        increaseScore,
        increaseWinStreak,
        resetWinStreak,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (context === undefined)
    throw new Error("configContext must be used within a Provider");
  return context;
};

export { PlayerProvider, usePlayer };
