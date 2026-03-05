/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PlayerContextType } from "./types";

const PlayerContext = createContext({} as PlayerContextType);

const DEFAULT_PLAYER = {
  name: "Player",
  score: 0,
};

const PlayerProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [player, setPlayer] = useState(DEFAULT_PLAYER);

  const updatePlayer = useCallback((name: string) => {
    setPlayer((prev) => ({ ...prev, name }));
  }, []);

  const increaseScore = useCallback((points: number) => {
    setPlayer((prev) => ({ ...prev, score: prev.score + points }));
  }, []);

  useEffect(() => {
    localStorage.setItem("player", JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    const stored = localStorage.getItem("player");
    if (stored) setPlayer(JSON.parse(stored));
    else localStorage.setItem("player", JSON.stringify(DEFAULT_PLAYER));
  }, []);

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
