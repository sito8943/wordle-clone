/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useLocalStorage } from "../hooks/";
import { useApi } from "./ApiProvider";
import { DEFAULT_PLAYER } from "./constant";
import type { Player, PlayerContextType, ProviderProps } from "./types";
import { normalizePlayerName } from "./utils";

const PlayerContext = createContext({} as PlayerContextType);

const PlayerProvider = ({ children }: ProviderProps) => {
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
