/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useApi } from "./ApiProvider";
import type { Player, PlayerContextType } from "./types";

const PlayerContext = createContext({} as PlayerContextType);

const DEFAULT_PLAYER: Player = {
  name: "Player",
  score: 0,
};

const PlayerProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { scoreClient } = useApi();

  const [player, setPlayer] = useLocalStorage<Player>("player", DEFAULT_PLAYER);

  const updatePlayer = useCallback(
    (name: string) => {
      setPlayer((prev) => ({ ...prev, name }));
    },
    [setPlayer],
  );

  const increaseScore = useCallback(
    (points: number) => {
      setPlayer((prev) => {
        const next = { ...prev, score: prev.score + points };
        void scoreClient.recordScore({ nick: next.name, score: next.score });
        return next;
      });
    },
    [scoreClient, setPlayer],
  );

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
