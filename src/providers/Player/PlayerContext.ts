import { createContext } from "react";
import type { PlayerContextType } from "./types";

export const PlayerContext = createContext<PlayerContextType | undefined>(
  undefined,
);
