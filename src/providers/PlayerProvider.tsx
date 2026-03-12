/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useApi } from "./ApiProvider";
import type { Player, PlayerContextType } from "./types";

const PlayerContext = createContext({} as PlayerContextType);

const DEFAULT_PLAYER: Player = {
  name: "Player",
  score: 0,
};

const normalizePlayerName = (value: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return DEFAULT_PLAYER.name;
  }

  return normalized.slice(0, 30);
};

const PlayerProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { scoreClient } = useApi();

  const [player, setPlayer] = useLocalStorage<Player>("player", DEFAULT_PLAYER);
  const didMountRef = useRef(false);
  const previousScoreRef = useRef(player.score);

  const updatePlayer = useCallback(
    (name: string) => {
      setPlayer((prev) => ({ ...prev, name: normalizePlayerName(name) }));
    },
    [setPlayer],
  );

  const increaseScore = useCallback(
    (points: number) => {
      setPlayer((prev) => ({ ...prev, score: prev.score + points }));
    },
    [setPlayer],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      previousScoreRef.current = player.score;
      return;
    }

    if (player.score > previousScoreRef.current) {
      void scoreClient.recordScore({ nick: player.name, score: player.score });
    }

    previousScoreRef.current = player.score;
  }, [player.name, player.score, scoreClient]);

  return (
    <PlayerContext.Provider value={{ player, updatePlayer, increaseScore }}>
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
