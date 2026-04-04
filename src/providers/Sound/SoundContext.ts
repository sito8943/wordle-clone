import { createContext } from "react";
import type { SoundContextType } from "./types";

export const SoundContext = createContext<SoundContextType | undefined>(
  undefined,
);
