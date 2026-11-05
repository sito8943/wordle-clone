import { createContext } from "react";
import type { ConsentContextType } from "./types";

export const ConsentContext = createContext<ConsentContextType | undefined>(
  undefined,
);
