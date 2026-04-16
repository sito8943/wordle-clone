import { createContext } from "react";
import type { DialogQueueContextType } from "./types";

export const DialogQueueContext =
  createContext<DialogQueueContextType | undefined>(undefined);
