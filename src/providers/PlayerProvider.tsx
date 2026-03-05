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

  const [player, setPlayer] = useState({
    name: "Player",
    score: 0,
  });

  const updateLocal = useCallback(() => {
    localStorage.setItem("player", JSON.stringify(player));
  }, [player]);

  const updatePlayer = useCallback(
    (name: string) => {
      setPlayer((prev) => ({ ...prev, name }));
      updateLocal();
    },
    [updateLocal],
  );

  const increaseScore = useCallback(
    (points: number) => {
      setPlayer((prev) => ({ ...prev, score: prev.score + points }));
      updateLocal();
    },
    [updateLocal],
  );

  useEffect(() => {
    const storedPlayer = localStorage.getItem("player");
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    } else {
      localStorage.setItem("player", JSON.stringify(DEFAULT_PLAYER));
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{ player, updateLocal, updatePlayer, increaseScore }}
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
